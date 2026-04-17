import React, { useState } from 'react'
import type { AuthDto } from '../../../shared/api/authApi'

interface AuthPageProps {
  isLoading: boolean
  onLogin: (payload: AuthDto) => Promise<void>
  onRegister: (payload: AuthDto) => Promise<void>
}

export const AuthPage: React.FC<AuthPageProps> = ({
  isLoading,
  onLogin,
  onRegister,
}) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isRegisterMode, setIsRegisterMode] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const validate = (): string | null => {
    if (!email.trim()) return 'Введите email'
    if (!email.includes('@')) return 'Email должен быть валидным'
    if (!password) return 'Введите пароль'
    if (password.length < 6) return 'Пароль должен содержать минимум 6 символов'
    return null
  }

  const handleSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault()
    const validationError = validate()
    if (validationError) {
      setError(validationError)
      return
    }
    setError(null)

    try {
      const payload: AuthDto = {
        email: email.trim(),
        password,
      }
      if (isRegisterMode) {
        await onRegister(payload)
      } else {
        await onLogin(payload)
      }
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : 'Ошибка авторизации')
    }
  }

  return (
    <div className='auth-shell'>
      <form className='auth-card' onSubmit={handleSubmit}>
        <h2 className='page-title auth-title'>
          {isRegisterMode ? '📝 Регистрация' : '🔐 Вход'}
        </h2>
        <input
          type='email'
          className='task-input'
          placeholder='Email'
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete='email'
        />
        <input
          type='password'
          className='task-input'
          placeholder='Пароль'
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          autoComplete={isRegisterMode ? 'new-password' : 'current-password'}
        />
        {error && <div className='form-error'>{error}</div>}
        <button type='submit' className='save-settings' disabled={isLoading}>
          {isLoading
            ? 'Загрузка...'
            : isRegisterMode
              ? 'Создать аккаунт'
              : 'Войти'}
        </button>
        <button
          type='button'
          className='auth-link'
          onClick={() => {
            setIsRegisterMode((prev) => !prev)
            setError(null)
          }}
          disabled={isLoading}
        >
          {isRegisterMode
            ? 'Уже есть аккаунт? Войти'
            : 'Нет аккаунта? Зарегистрироваться'}
        </button>
      </form>
    </div>
  )
}
