from django.db import models
from django.contrib.auth import get_user_model
from django.utils import timezone
from business.models import Business
from django.utils.translation import gettext_lazy as _
import uuid
from events.models import Event
from packages.models import Package

User = get_user_model()

class PackageBooking(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('confirmed', 'Confirmed'),
        ('cancelled', 'Cancelled'),
        ('completed', 'Completed')
    ]

    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='package_bookings')
    package = models.ForeignKey(Package, on_delete=models.CASCADE, related_name='bookings')
    number_of_people = models.PositiveIntegerField()
    special_requests = models.TextField(blank=True, null=True)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Booking {self.id} - {self.package.name}"

class PackagePayment(models.Model):
    STATUS_CHOICES = [
        ('pending', 'Pending'),
        ('completed', 'Completed'),
        ('failed', 'Failed'),
        ('refunded', 'Refunded')
    ]

    PAYMENT_METHODS = [
        ('stripe', 'Stripe')
    ]

    booking = models.OneToOneField(PackageBooking, on_delete=models.CASCADE, related_name='payment')
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    payment_method = models.CharField(max_length=20, choices=PAYMENT_METHODS)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    transaction_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_payment_intent_id = models.CharField(max_length=255, blank=True, null=True)
    stripe_client_secret = models.CharField(max_length=255, blank=True, null=True)
    currency = models.CharField(max_length=3, default='usd')
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Payment {self.id} - {self.booking.package.name}"

class PackageReview(models.Model):
    booking = models.OneToOneField(PackageBooking, on_delete=models.CASCADE, related_name='review')
    rating = models.PositiveIntegerField()
    title = models.CharField(max_length=200)
    content = models.TextField()
    helpful = models.PositiveIntegerField(default=0)
    reported = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ['-created_at']

    def __str__(self):
        return f"Review {self.id} - {self.booking.package.name}"