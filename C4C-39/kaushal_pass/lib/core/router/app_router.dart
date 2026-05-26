import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:go_router/go_router.dart';

import '../../features/auth/presentation/login_screen.dart';
import '../../features/auth/presentation/otp_screen.dart';
import '../../features/onboarding/presentation/onboarding_screen.dart';
import '../../features/assessment/presentation/assessment_screen.dart';
import '../../features/assessment/presentation/result_screen.dart';
import '../../features/passport/presentation/passport_screen.dart';
import '../../features/profile/presentation/profile_screen.dart';
import '../../features/dashboard/presentation/dashboard_screen.dart';
import '../../features/community/presentation/community_screen.dart';
import '../../features/chat/presentation/chat_screen.dart';
import '../../features/schemes/presentation/schemes_screen.dart';

final appRouterProvider = Provider<GoRouter>((ref) {
  return GoRouter(
    initialLocation: '/login',
    routes: [
      GoRoute(
        path: '/',
        redirect: (context, state) => '/login',
      ),
      GoRoute(
        path: '/login',
        builder: (context, state) => const LoginScreen(),
      ),
      GoRoute(
        path: '/otp',
        builder: (context, state) {
          // Phone number is passed as extra from login screen
          final phone = state.extra as String? ?? '';
          return OtpScreen(phone: phone);
        },
      ),
      GoRoute(
        path: '/onboarding',
        builder: (context, state) => const OnboardingScreen(),
      ),
      GoRoute(
        path: '/dashboard',
        builder: (context, state) => const DashboardScreen(),
      ),
      GoRoute(
        path: '/assessment',
        builder: (context, state) => const AssessmentScreen(),
      ),
      GoRoute(
        path: '/result',
        builder: (context, state) {
          // Assessment result is passed as extra Map<String, dynamic>
          final result = state.extra as Map<String, dynamic>? ?? {};
          return ResultScreen(result: result);
        },
      ),
      GoRoute(
        path: '/passport',
        builder: (context, state) => const PassportScreen(),
      ),
      GoRoute(
        path: '/profile',
        builder: (context, state) => const ProfileScreen(),
      ),
      GoRoute(
        path: '/community',
        builder: (context, state) => const CommunityScreen(),
      ),
      GoRoute(
        path: '/chat',
        builder: (context, state) => const ChatScreen(),
      ),
      GoRoute(
        path: '/schemes',
        builder: (context, state) => const SchemesScreen(),
      ),
    ],
  );
});
