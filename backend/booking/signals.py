from django.db.models.signals import post_save
from django.dispatch import receiver
from .models import PackageBooking, PackagePayment

@receiver(post_save, sender=PackageBooking)
def create_package_payment(sender, instance, created, **kwargs):
    if created and instance.status == 'confirmed':
        PackagePayment.objects.create(
            booking=instance,
            amount=instance.package.price * instance.number_of_people,
            payment_method='stripe',
            status='pending'
        )

@receiver(post_save, sender=PackagePayment)
def update_booking_status(sender, instance, **kwargs):
    if instance.status == 'completed' and instance.booking.status == 'pending':
        instance.booking.status = 'confirmed'
        instance.booking.save()
    elif instance.status == 'refunded':
        instance.booking.status = 'cancelled'
        instance.booking.save()