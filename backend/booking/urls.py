from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import PackageBookingViewSet, PackagePaymentViewSet, PackageReviewViewSet

app_name = 'booking'

router = DefaultRouter()
router.register(r'bookings', PackageBookingViewSet, basename='package-booking')
router.register(r'payments', PackagePaymentViewSet, basename='package-payment')
router.register(r'reviews', PackageReviewViewSet, basename='package-review')

urlpatterns = [
    path('', include(router.urls)),
]