import stripe
from django.conf import settings
from django.core.exceptions import ValidationError
from decimal import Decimal

stripe.api_key = settings.STRIPE_SECRET_KEY

class StripeService:
    @staticmethod
    def create_payment_intent(amount, currency='usd', metadata=None):
        """
        Create a Stripe PaymentIntent
        """
        try:
            # Convert amount to cents/smallest currency unit
            amount_in_cents = int(Decimal(amount) * 100)
            
            intent = stripe.PaymentIntent.create(
                amount=amount_in_cents,
                currency=currency,
                metadata=metadata or {},
                automatic_payment_methods={"enabled": True}
            )
            return intent
        except stripe.error.StripeError as e:
            raise ValidationError(f"Stripe error: {str(e)}")

    @staticmethod
    def confirm_payment_intent(payment_intent_id):
        """
        Confirm a Stripe PaymentIntent
        """
        try:
            intent = stripe.PaymentIntent.retrieve(payment_intent_id)
            return intent
        except stripe.error.StripeError as e:
            raise ValidationError(f"Stripe error: {str(e)}")

    @staticmethod
    def create_refund(payment_intent_id, amount=None):
        """
        Create a refund for a payment
        """
        try:
            refund_params = {
                'payment_intent': payment_intent_id,
            }
            if amount:
                # Convert amount to cents/smallest currency unit
                refund_params['amount'] = int(Decimal(amount) * 100)
            
            refund = stripe.Refund.create(**refund_params)
            return refund
        except stripe.error.StripeError as e:
            raise ValidationError(f"Stripe error: {str(e)}")

    @staticmethod
    def get_payment_intent(payment_intent_id):
        """
        Retrieve a PaymentIntent
        """
        try:
            return stripe.PaymentIntent.retrieve(payment_intent_id)
        except stripe.error.StripeError as e:
            raise ValidationError(f"Stripe error: {str(e)}") 