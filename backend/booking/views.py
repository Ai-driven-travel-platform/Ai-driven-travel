from rest_framework import viewsets, status, filters
from rest_framework.decorators import action
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.utils import timezone
from .models import PackageBooking, PackagePayment, PackageReview
from .serializers import PackageBookingSerializer, PackagePaymentSerializer, PackageReviewSerializer
from .permissions import IsBookingOwner, IsPaymentOwner, IsReviewOwner
from .services import StripeService
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.views.decorators.csrf import csrf_exempt
from django.conf import settings
import stripe
from django.http import HttpResponse

class PackageBookingViewSet(viewsets.ModelViewSet):
    serializer_class = PackageBookingSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return PackageBooking.objects.none()
        return PackageBooking.objects.filter(user=self.request.user)

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="Create a new package booking",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['package', 'number_of_people'],
            properties={
                'package': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    description="ID of the package to book"
                ),
                'number_of_people': openapi.Schema(
                    type=openapi.TYPE_INTEGER,
                    minimum=1,
                    description="Number of people for the booking (minimum 1)"
                ),
                'special_requests': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="Any special requests for the booking (optional)"
                )
            }
        ),
        responses={
            201: openapi.Response(
                description="Package booking created successfully",
                schema=PackageBookingSerializer
            ),
            400: "Bad Request - Invalid data provided",
            401: "Unauthorized - Authentication required"
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data, context={'request': request})
        serializer.is_valid(raise_exception=True)
        booking = serializer.save()
        
        # Create initial payment record
        payment = PackagePayment.objects.create(
            booking=booking,
            amount=booking.package.price * booking.number_of_people,
            payment_method='stripe',
            status='pending',
            currency='usd'
        )
        
        # Create Stripe PaymentIntent
        try:
            intent = StripeService.create_payment_intent(
                amount=payment.amount,
                currency=payment.currency,
                metadata={
                    'booking_id': str(booking.id),
                    'payment_id': str(payment.id)
                }
            )
            
            # Update payment with Stripe details
            payment.stripe_payment_intent_id = intent.id
            payment.stripe_client_secret = intent.client_secret
            payment.save()
            
            # Add payment details to response
            response_data = serializer.data
            response_data['payment'] = {
                'id': payment.id,
                'amount': payment.amount,
                'currency': payment.currency,
                'client_secret': payment.stripe_client_secret,
                'status': payment.status
            }
            
            return Response(response_data, status=status.HTTP_201_CREATED)
            
        except Exception as e:
            booking.delete()  # Rollback booking if payment creation fails
            return Response(
                {'error': f'Failed to create payment: {str(e)}'},
                status=status.HTTP_400_BAD_REQUEST
            )

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="Verify payment for a booking",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['payment_intent_id'],
            properties={
                'payment_intent_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="The Stripe PaymentIntent ID"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Payment verified successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING),
                        'message': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            ),
            400: "Bad Request - Invalid payment",
            404: "Not Found - Booking does not exist"
        }
    )
    @action(detail=True, methods=['post'])
    def verify_payment(self, request, pk=None):
        booking = self.get_object()
        payment = get_object_or_404(PackagePayment, booking=booking)
        
        payment_intent_id = request.data.get('payment_intent_id')
        if not payment_intent_id:
            return Response({
                'status': 'error',
                'message': 'Payment intent ID is required',
                'client_secret': payment.stripe_client_secret
            }, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            # Verify payment with Stripe
            intent = StripeService.get_payment_intent(payment_intent_id)
            
            if intent.status == 'succeeded':
                payment.status = 'succeeded'
                payment.save()
                
                booking.status = 'confirmed'
                booking.save()
                
                return Response({
                    'status': 'success',
                    'message': 'Payment verified successfully'
                })
            elif intent.status == 'requires_payment_method':
                return Response({
                    'status': 'error',
                    'message': 'Please complete the payment first using the client secret',
                    'client_secret': payment.stripe_client_secret
                }, status=status.HTTP_400_BAD_REQUEST)
            elif intent.status == 'requires_confirmation':
                # Confirm the payment intent
                intent = StripeService.confirm_payment_intent(payment_intent_id)
                if intent.status == 'succeeded':
                    payment.status = 'succeeded'
                    payment.save()
                    
                    booking.status = 'confirmed'
                    booking.save()
                    
                    return Response({
                        'status': 'success',
                        'message': 'Payment confirmed and verified successfully'
                    })
            else:
                return Response({
                    'status': 'error',
                    'message': f'Payment not successful. Status: {intent.status}',
                    'client_secret': payment.stripe_client_secret
                }, status=status.HTTP_400_BAD_REQUEST)
                
        except Exception as e:
            return Response({
                'status': 'error',
                'message': f'Failed to verify payment: {str(e)}',
                'client_secret': payment.stripe_client_secret
            }, status=status.HTTP_400_BAD_REQUEST)

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="Get payment status for a booking",
        responses={
            200: openapi.Response(
                description="Payment status retrieved successfully",
                schema=PackagePaymentSerializer
            ),
            404: "Not Found - Booking does not exist"
        }
    )
    @action(detail=True, methods=['get'])
    def payment_status(self, request, pk=None):
        booking = self.get_object()
        payment = get_object_or_404(PackagePayment, booking=booking)
        serializer = PackagePaymentSerializer(payment)
        return Response(serializer.data)

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="List all package bookings for the authenticated user",
        responses={
            200: openapi.Response(
                description="List of package bookings",
                schema=PackageBookingSerializer(many=True)
            ),
            401: "Unauthorized - Authentication required"
        }
    )
    def list(self, request, *args, **kwargs):
        queryset = self.get_queryset()
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="Retrieve a specific package booking",
        responses={
            200: openapi.Response(
                description="Package booking details",
                schema=PackageBookingSerializer
            ),
            404: "Not Found - Booking does not exist",
            401: "Unauthorized - Authentication required"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="Cancel a package booking",
        responses={
            200: openapi.Response(
                description="Package booking cancelled successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING, description="New booking status")
                    }
                )
            ),
            400: "Bad Request - Booking is already cancelled",
            404: "Not Found - Booking does not exist",
            401: "Unauthorized - Authentication required"
        }
    )
    @action(detail=True, methods=['post'])
    def cancel(self, request, pk=None):
        booking = self.get_object()
        if booking.status == 'cancelled':
            return Response(
                {'error': 'Booking is already cancelled'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'cancelled'
        booking.save()
        return Response({'status': 'cancelled'})

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="Mark a package booking as completed",
        responses={
            200: openapi.Response(
                description="Package booking marked as completed",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING, description="New booking status")
                    }
                )
            ),
            400: "Bad Request - Only confirmed bookings can be completed",
            404: "Not Found - Booking does not exist",
            401: "Unauthorized - Authentication required"
        }
    )
    @action(detail=True, methods=['post'])
    def complete(self, request, pk=None):
        booking = self.get_object()
        if booking.status != 'confirmed':
            return Response(
                {'error': 'Only confirmed bookings can be marked as completed'},
                status=status.HTTP_400_BAD_REQUEST
            )
        booking.status = 'completed'
        booking.save()
        return Response({'status': 'completed'})

    @swagger_auto_schema(
        tags=['Package Bookings'],
        operation_description="List upcoming package bookings",
        responses={
            200: openapi.Response(
                description="List of upcoming package bookings",
                schema=PackageBookingSerializer(many=True)
            ),
            401: "Unauthorized - Authentication required"
        }
    )
    @action(detail=False, methods=['get'])
    def upcoming(self, request):
        queryset = self.get_queryset().filter(
            status='confirmed',
            package__departure__gt=timezone.now()
        )
        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class PackagePaymentViewSet(viewsets.ModelViewSet):
    serializer_class = PackagePaymentSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return PackagePayment.objects.none()
        return PackagePayment.objects.filter(booking__user=self.request.user)

    @swagger_auto_schema(
        tags=['Package Payments'],
        operation_description="Create a Stripe payment intent for a package booking",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            required=['booking_id', 'amount'],
            properties={
                'booking_id': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    description="The ID of your package booking"
                ),
                'amount': openapi.Schema(
                    type=openapi.TYPE_NUMBER,
                    description="The amount to charge in the specified currency"
                ),
                'currency': openapi.Schema(
                    type=openapi.TYPE_STRING,
                    default='usd',
                    description="The currency code (default: usd)"
                )
            }
        ),
        responses={
            200: openapi.Response(
                description="Stripe payment intent created successfully",
                schema=PackagePaymentSerializer
            ),
            400: "Bad Request - Invalid data provided",
            404: "Not Found - Package booking does not exist",
            401: "Unauthorized - Authentication required"
        }
    )
    @action(detail=False, methods=['post'])
    def create_stripe_payment(self, request):
        booking_id = request.data.get('booking_id')
        amount = request.data.get('amount')
        currency = request.data.get('currency', 'usd')

        if not booking_id or not amount:
            return Response(
                {'error': 'booking_id and amount are required'},
                status=status.HTTP_400_BAD_REQUEST
            )

        try:
            booking = PackageBooking.objects.get(id=booking_id, user=request.user)
        except PackageBooking.DoesNotExist:
            return Response(
                {'error': 'Booking not found'},
                status=status.HTTP_404_NOT_FOUND
            )

        try:
            # Create Stripe PaymentIntent
            intent = StripeService.create_payment_intent(
                amount=amount,
                currency=currency,
                metadata={'booking_id': str(booking.id)}
            )

            # Create or update Payment record
            payment, created = PackagePayment.objects.get_or_create(
                booking=booking,
                defaults={
                    'amount': amount,
                    'payment_method': 'stripe',
                    'status': 'pending',
                    'stripe_payment_intent_id': intent.id,
                    'stripe_client_secret': intent.client_secret,
                    'currency': currency
                }
            )

            if not created:
                payment.amount = amount
                payment.stripe_payment_intent_id = intent.id
                payment.stripe_client_secret = intent.client_secret
                payment.status = 'pending'
                payment.save()

            serializer = self.get_serializer(payment)
            return Response(serializer.data)

        except Exception as e:
            return Response(
                {'error': str(e)},
                status=status.HTTP_400_BAD_REQUEST
            )

class PackageReviewViewSet(viewsets.ModelViewSet):
    serializer_class = PackageReviewSerializer
    permission_classes = [IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return PackageReview.objects.none()
        return PackageReview.objects.filter(booking__user=self.request.user)

    @swagger_auto_schema(
        tags=['Package Reviews'],
        operation_description="Create a new package review",
        request_body=PackageReviewSerializer,
        responses={
            201: openapi.Response(
                description="Package review created successfully",
                schema=PackageReviewSerializer
            ),
            400: "Bad Request - Invalid data provided",
            401: "Unauthorized - Authentication required"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Package Reviews'],
        operation_description="Mark a package review as helpful",
        responses={
            200: openapi.Response(
                description="Package review marked as helpful",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'helpful': openapi.Schema(type=openapi.TYPE_INTEGER, description="Number of helpful votes")
                    }
                )
            ),
            404: "Not Found - Review does not exist",
            401: "Unauthorized - Authentication required"
        }
    )
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful += 1
        review.save()
        return Response({'helpful': review.helpful})

    @swagger_auto_schema(
        tags=['Package Reviews'],
        operation_description="Report a package review",
        responses={
            200: openapi.Response(
                description="Package review reported successfully",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'message': openapi.Schema(type=openapi.TYPE_STRING, description="Success message")
                    }
                )
            ),
            404: "Not Found - Review does not exist",
            401: "Unauthorized - Authentication required"
        }
    )
    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        review = self.get_object()
        review.reported = True
        review.save()
        return Response({'message': 'Review reported successfully'})

@csrf_exempt
def stripe_webhook(request):
    payload = request.body
    sig_header = request.META.get('HTTP_STRIPE_SIGNATURE')
    event = None
    
    try:
        event = stripe.Webhook.construct_event(
            payload, sig_header, settings.STRIPE_WEBHOOK_SECRET
        )
    except ValueError:
        return HttpResponse(status=400)
    except stripe.error.SignatureVerificationError:
        return HttpResponse(status=400)

    # Handle the event
    if event['type'] == 'payment_intent.succeeded':
        intent = event['data']['object']
        payment_intent_id = intent['id']
        
        try:
            payment = PackagePayment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.status = 'succeeded'
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.status = 'confirmed'
            booking.save()
            
            # You could also send confirmation emails here
            
        except PackagePayment.DoesNotExist:
            pass
            
    elif event['type'] == 'payment_intent.payment_failed':
        intent = event['data']['object']
        payment_intent_id = intent['id']
        
        try:
            payment = PackagePayment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.status = 'failed'
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.status = 'cancelled'
            booking.save()
            
        except PackagePayment.DoesNotExist:
            pass
            
    elif event['type'] == 'charge.refunded':
        charge = event['data']['object']
        payment_intent_id = charge['payment_intent']
        
        try:
            payment = PackagePayment.objects.get(stripe_payment_intent_id=payment_intent_id)
            payment.status = 'refunded'
            payment.save()
            
            # Update booking status
            booking = payment.booking
            booking.status = 'cancelled'
            booking.save()
            
        except PackagePayment.DoesNotExist:
            pass

    return HttpResponse(status=200)