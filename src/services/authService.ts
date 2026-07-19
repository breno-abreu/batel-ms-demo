import { demoAuthApi } from '@/demo/api/miscDemoApi'
import { IS_DEMO_MODE } from '@/demo/demoConfig'
import { httpClient } from '@/services/httpClient'
import type {
  ApiResponse,
  AuthTokens,
  LoginRequest,
  RegisterRequest,
  RegistrationResult
} from '@/types/auth'

const DEVICE_NAME = 'Bless App Web'

export const authService = {
  register(payload: RegisterRequest) {
    if (IS_DEMO_MODE) {
      return demoAuthApi.register()
    }

    return httpClient.post<ApiResponse<RegistrationResult>>(
      '/api/auth/register',
      {
        ...payload,
        deviceName: payload.deviceName ?? DEVICE_NAME
      },
      { skipErrorRedirect: true, skipAuthRefresh: true }
    )
  },

  login(payload: LoginRequest) {
    if (IS_DEMO_MODE) {
      return demoAuthApi.login()
    }

    return httpClient.post<ApiResponse<AuthTokens>>(
      '/api/auth/login',
      {
        ...payload,
        deviceName: payload.deviceName ?? DEVICE_NAME
      },
      { skipErrorRedirect: true, skipAuthRefresh: true }
    )
  },

  refresh(refreshToken: string) {
    if (IS_DEMO_MODE) {
      return demoAuthApi.refresh()
    }

    return httpClient.post<ApiResponse<AuthTokens>>(
      '/api/auth/refresh',
      {
        refreshToken,
        deviceName: DEVICE_NAME
      },
      { skipErrorRedirect: true, skipAuthRefresh: true }
    )
  },

  logout(refreshToken: string) {
    if (IS_DEMO_MODE) {
      return demoAuthApi.logout()
    }

    return httpClient.post<ApiResponse<object | null>>(
      '/api/auth/logout',
      { refreshToken },
      { skipErrorRedirect: true, skipAuthRefresh: true }
    )
  },

  me() {
    if (IS_DEMO_MODE) {
      return demoAuthApi.me()
    }

    return httpClient.get<ApiResponse<AuthTokens['user']>>('/api/auth/me')
  }
}
