from rest_framework import viewsets, status, permissions, serializers
from rest_framework.decorators import action
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from django.db.models import Q
from .models import Business, BusinessReview, SavedBusiness
from .serializers import (
    BusinessListSerializer, BusinessDetailSerializer, BusinessCreateSerializer,
    BusinessReviewSerializer, BusinessReviewCreateSerializer, SavedBusinessSerializer
)
from drf_yasg.utils import swagger_auto_schema
from drf_yasg import openapi
from django.utils import timezone
from .permissions import IsBusinessOwnerOrReadOnly, IsReviewOwnerOrReadOnly
from rest_framework.pagination import PageNumberPagination
from django.db.models import Case, When, Value, BooleanField

class BusinessPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class BusinessViewSet(viewsets.ModelViewSet):
    queryset = Business.objects.all()
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsBusinessOwnerOrReadOnly]
    pagination_class = BusinessPagination

    def get_permissions(self):
        if self.action in ['verify', 'toggle_featured']:
            print(f"User: {self.request.user}, ID: {self.request.user.id}, Username: {self.request.user.username}, Email: {self.request.user.email}, Is staff: {self.request.user.is_staff}, Is superuser: {self.request.user.is_superuser}, Permissions: {self.request.user.get_all_permissions()}")
            # Only admins can verify or toggle featured status
            return [permissions.IsAdminUser()]
        return super().get_permissions()

    def get_serializer_class(self):
        if self.action == 'create':
            return BusinessCreateSerializer
        elif self.action in ['retrieve', 'update', 'partial_update']:
            return BusinessDetailSerializer
        return BusinessListSerializer

    def perform_create(self, serializer):
        serializer.save(owner=self.request.user)

    def get_queryset(self):
        queryset = Business.objects.all()
        
        # Get query parameters
        search = self.request.query_params.get('search', '').strip()
        status = self.request.query_params.get('status', '').strip()
        business_type = self.request.query_params.get('business_type', '').strip()
        region = self.request.query_params.get('region', '').strip()
        city = self.request.query_params.get('city', '').strip()
        order_by = self.request.query_params.get('order_by', '').strip()
        
        # Apply search filter
        if search:
            queryset = queryset.filter(
                Q(name__icontains=search) |
                Q(description__icontains=search)
            )
        print("search term: ",search)
        # Apply status filter
        if status:
            queryset = queryset.filter(status__iexact=status)
        
        # Apply business type filter
        if business_type:
            queryset = queryset.filter(business_type__iexact=business_type)
        
        # Apply region filter
        if region:
            queryset = queryset.filter(region__iexact=region)
        
        # Apply city filter
        if city:
            queryset = queryset.filter(city__iexact=city)
        
        # Apply ordering
        if order_by:
            if order_by.lower() == 'rating':
                queryset = queryset.order_by('-average_rating')
            elif order_by.lower() == 'date':
                queryset = queryset.order_by('-created_at')
        
        return queryset.distinct()

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Create a new business",
        request_body=BusinessCreateSerializer,
        responses={
            201: BusinessDetailSerializer,
            400: "Bad Request"
        }
    )
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        self.perform_create(serializer)
        headers = self.get_success_headers(serializer.data)
        return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="List all businesses",
        manual_parameters=[
            openapi.Parameter('search', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Search by name or description"),
            openapi.Parameter('status', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filter by status (pending, approved, rejected)"),
            openapi.Parameter('business_type', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filter by business type"),
            openapi.Parameter('region', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filter by region"),
            openapi.Parameter('city', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Filter by city"),
            openapi.Parameter('order_by', openapi.IN_QUERY, type=openapi.TYPE_STRING, description="Order by rating or date"),
            openapi.Parameter('page', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="Page number"),
            openapi.Parameter('page_size', openapi.IN_QUERY, type=openapi.TYPE_INTEGER, description="Number of results per page")
        ],
        responses={
            200: BusinessListSerializer(many=True)
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Retrieve a business",
        responses={
            200: BusinessDetailSerializer,
            404: "Not Found"
        }
    )
    def retrieve(self, request, *args, **kwargs):
        return super().retrieve(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Update a business",
        request_body=BusinessDetailSerializer,
        responses={
            200: BusinessDetailSerializer,
            400: "Bad Request",
            404: "Not Found"
        }
    )
    def update(self, request, *args, **kwargs):
        return super().update(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Delete a business",
        responses={
            204: "No Content",
            404: "Not Found"
        }
    )
    def destroy(self, request, *args, **kwargs):
        return super().destroy(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="List featured businesses",
        responses={
            200: BusinessListSerializer(many=True)
        }
    )
    @action(detail=False, methods=['get'])
    def featured(self, request):
        featured_businesses = self.get_queryset().filter(is_featured=True)
        serializer = self.get_serializer(featured_businesses, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        tags=['Businessmetal'],
        operation_description="List user's businesses",
        responses={
            200: BusinessListSerializer(many=True)
        }
    )
    @action(detail=False, methods=['get'])
    def my_businesses(self, request):
        my_businesses = self.get_queryset().filter(owner=request.user)
        serializer = self.get_serializer(my_businesses, many=True)
        return Response(serializer.data)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Toggle business featured status",
        responses={
            200: openapi.Response(
                description="Featured status toggled",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'is_featured': openapi.Schema(type=openapi.TYPE_BOOLEAN)
                    }
                )
            ),
            403: "Forbidden",
            404: "Not Found"
        }
    )
    @action(detail=True, methods=['post'])
    def toggle_featured(self, request, pk=None):
        business = self.get_object()
        business.is_featured = not business.is_featured
        business.save()
        return Response({'is_featured': business.is_featured})

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Verify a business",
        responses={
            200: openapi.Response(
                description="Business verified",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'is_verified': openapi.Schema(type=openapi.TYPE_BOOLEAN),
                        'verification_date': openapi.Schema(type=openapi.TYPE_STRING, format='date-time')
                    }
                )
            ),
            403: "Forbidden",
            404: "Not Found"
        }
    )
    @action(detail=True, methods=['post'])
    def verify(self, request, pk=None):
        business = self.get_object()
        business.is_verified = True
        business.verification_date = timezone.now()
        business.save()
        return Response({
            'is_verified': business.is_verified,
            'verification_date': business.verification_date
        })

class BusinessReviewViewSet(viewsets.ModelViewSet):
    serializer_class = BusinessReviewSerializer
    permission_classes = [permissions.IsAuthenticatedOrReadOnly, IsReviewOwnerOrReadOnly]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return BusinessReview.objects.none()
        return BusinessReview.objects.filter(business_id=self.kwargs.get('business_pk'))

    def get_serializer_class(self):
        if self.action == 'create':
            return BusinessReviewCreateSerializer
        return BusinessReviewSerializer

    def perform_create(self, serializer):
        business = get_object_or_404(Business, pk=self.kwargs.get('business_pk'))
        serializer.save(user=self.request.user, business=business)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Create a business review",
        request_body=BusinessReviewCreateSerializer,
        responses={
            201: BusinessReviewSerializer,
            400: "Bad Request"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="List business reviews",
        responses={
            200: BusinessReviewSerializer(many=True)
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Report a review",
        request_body=openapi.Schema(
            type=openapi.TYPE_OBJECT,
            properties={
                'reason': openapi.Schema(type=openapi.TYPE_STRING)
            }
        ),
        responses={
            200: openapi.Response(
                description="Review reported",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'status': openapi.Schema(type=openapi.TYPE_STRING)
                    }
                )
            )
        }
    )
    @action(detail=True, methods=['post'])
    def report(self, request, pk=None):
        review = self.get_object()
        review.is_reported = True
        review.save()
        return Response({'message': 'Review reported successfully'})

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Mark review as helpful",
        responses={
            200: openapi.Response(
                description="Helpful votes updated",
                schema=openapi.Schema(
                    type=openapi.TYPE_OBJECT,
                    properties={
                        'helpful_votes': openapi.Schema(type=openapi.TYPE_INTEGER)
                    }
                )
            )
        }
    )
    @action(detail=True, methods=['post'])
    def mark_helpful(self, request, pk=None):
        review = self.get_object()
        review.helpful_votes += 1
        review.save()
        return Response({'helpful_votes': review.helpful_votes})

class SavedBusinessViewSet(viewsets.ModelViewSet):
    serializer_class = SavedBusinessSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        if getattr(self, 'swagger_fake_view', False):
            return SavedBusiness.objects.none()
        return SavedBusiness.objects.filter(user=self.request.user)

    def perform_create(self, serializer):
        if getattr(self, 'swagger_fake_view', False):
            return
        business = get_object_or_404(Business, pk=self.kwargs.get('business_pk'))
        if SavedBusiness.objects.filter(user=self.request.user, business=business).exists():
            raise serializers.ValidationError('Business is already saved')
        serializer.save(user=self.request.user, business=business)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="Save a business",
        responses={
            201: SavedBusinessSerializer,
            400: "Bad Request"
        }
    )
    def create(self, request, *args, **kwargs):
        return super().create(request, *args, **kwargs)

    @swagger_auto_schema(
        tags=['Business'],
        operation_description="List saved businesses",
        responses={
            200: SavedBusinessSerializer(many=True)
        }
    )
    def list(self, request, *args, **kwargs):
        return super().list(request, *args, **kwargs)