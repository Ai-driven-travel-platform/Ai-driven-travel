"""
URL configuration for the users app.

API Endpoints Documentation:

Authentication:
-------------
POST /api/users/register/
    Register a new user
    Body: {username, email, password, password2, first_name, last_name, role, interests}

POST /api/users/login/
    Login user
    Body: {email, password}

POST /api/users/logout/
    Logout user (requires authentication)
    Body: {refresh}

Email Management:
---------------
POST /api/users/verify-email/
    Verify email address
    Body: {email, code}

POST /api/users/resend-verification/
    Resend verification code
    Body: {email}

POST /api/users/change-email/
    Change email address (requires authentication)
    Body: {new_email, password}

Password Management:
-----------------
POST /api/users/forgot-password/
    Request password reset
    Body: {email}

POST /api/users/reset-password/{token}/
    Reset password using token
    Body: {new_password, new_password2}

POST /api/users/change-password/
    Change password (requires authentication)
    Body: {old_password, new_password, new_password2}

User Profile:
-----------
GET /api/users/me/
    Get current user profile (requires authentication)

User Preferences:
---------------
POST /api/users/preferences/
    Set user travel preferences (requires authentication)
    Body: {interests}

GET /api/users/landing-page/
    Get personalized landing page content (requires authentication)

Admin Management (requires admin access):
-------------------------------------
GET    /api/users/management/
POST   /api/users/management/
GET    /api/users/management/{id}/
PUT    /api/users/management/{id}/
PATCH  /api/users/management/{id}/
DELETE /api/users/management/{id}/
POST   /api/users/management/{id}/toggle-active/
POST   /api/users/management/{id}/toggle-staff/

Profile Management:
----------------
GET    /api/users/profiles/
POST   /api/users/profiles/
GET    /api/users/profiles/{id}/
PUT    /api/users/profiles/{id}/
PATCH  /api/users/profiles/{id}/
DELETE /api/users/profiles/{id}/

Business Profile Management:
------------------------
GET    /api/users/business-profiles/
POST   /api/users/business-profiles/
GET    /api/users/business-profiles/{id}/
PUT    /api/users/business-profiles/{id}/
PATCH  /api/users/business-profiles/{id}/
DELETE /api/users/business-profiles/{id}/
"""
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UserViewSet, ProfileViewSet,
    BusinessProfileViewSet
)

app_name = 'users'

# Create a router and register viewsets
router = DefaultRouter()
router.register(r'users', UserViewSet, basename='user')
router.register(r'profiles', ProfileViewSet, basename='profile')
router.register(r'business-profiles', BusinessProfileViewSet, basename='business-profile')

# API URLs with explicit patterns
urlpatterns = [
    path('', include(router.urls)),

    # Authentication endpoints
    path('register/', UserViewSet.as_view({'post': 'register'}), name='user-register'),
    path('verify-email/', UserViewSet.as_view({'post': 'verify_email'}), name='user-verify-email'),
    path('forgot-password/', UserViewSet.as_view({'post': 'forgot_password'}), name='user-forgot-password'),
    path('change-password/', UserViewSet.as_view({'post': 'change_password'}), name='user-change-password'),
    path('change-email/', UserViewSet.as_view({'post': 'change_email'}), name='user-change-email'),
    path('logout/', UserViewSet.as_view({'post': 'logout'}), name='user-logout'),
    path('login/', UserViewSet.as_view({'post': 'login'}), name='user-login'),
    path('me/', UserViewSet.as_view({'get': 'me'}), name='user-me'),

    # Email verification endpoints
    path('resend-verification/', UserViewSet.as_view({'post': 'resend_verification'}), name='user-resend-verification'),

    # Preferences endpoints
    path('preferences/', UserViewSet.as_view({'post': 'preferences'}), name='user-preferences'),
    path('landing-page/', UserViewSet.as_view({'get': 'landing_page'}), name='user-landing-page'),

    # Admin management endpoints
    path('management/', include([
        path('', UserViewSet.as_view({'get': 'list', 'post': 'create'}), name='user-list'),
        path('<int:pk>/', UserViewSet.as_view({
            'get': 'retrieve',
            'put': 'update',
            'patch': 'partial_update',
            'delete': 'destroy'
        }), name='user-detail'),
        path('<int:pk>/toggle-active/', UserViewSet.as_view({'post': 'toggle_active'}), name='user-toggle-active'),
        path('<int:pk>/toggle-staff/', UserViewSet.as_view({'post': 'toggle_staff'}), name='user-toggle-staff'),
    ])),
]