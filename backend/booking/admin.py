from django.contrib import admin
from .models import PackageBooking, PackagePayment, PackageReview

@admin.register(PackageBooking)
class PackageBookingAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'package', 'number_of_people', 'status', 'created_at')
    list_filter = ('status', 'created_at')
    search_fields = ('user__email', 'package__name')
    readonly_fields = ('created_at', 'updated_at')

@admin.register(PackagePayment)
class PackagePaymentAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'amount', 'payment_method', 'status', 'created_at')
    list_filter = ('status', 'payment_method', 'created_at')
    search_fields = ('booking__user__email', 'booking__package__name')
    readonly_fields = ('created_at',)

@admin.register(PackageReview)
class PackageReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'booking', 'rating', 'title', 'helpful', 'reported', 'created_at')
    list_filter = ('rating', 'reported', 'created_at')
    search_fields = ('booking__user__email', 'booking__package__name', 'title', 'content')
    readonly_fields = ('created_at',)