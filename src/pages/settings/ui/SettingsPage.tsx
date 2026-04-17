import React, { useEffect, useState } from 'react'

interface SettingsPageProps {
  notificationsEnabled: boolean
  email: string
  name: string
  workInterval: number
  breakInterval: number
  intervalCount: number
  onSave: (options: {
    notificationsEnabled: boolean
    email: string
    password: string
    name?: string
    workInterval?: number
    breakInterval?: number
    intervalCount?: number
  }) => Promise<void>
}

export const SettingsPage: React.FC<SettingsPageProps> = ({
  notificationsEnabled,
  email,
  name,
  workInterval,
  breakInterval,
  intervalCount,
  onSave,
}) => {
  const [notify, setNotify] = useState<boolean>(notificationsEnabled)
  const [emailValue, setEmailValue] = useState<string>(email)
  const [passwordValue, setPasswordValue] = useState<string>('')
  const [nameValue, setNameValue] = useState<string>(name)
  const [workIntervalValue, setWorkIntervalValue] = useState<number>(workInterval)
  const [breakIntervalValue, setBreakIntervalValue] = useState<number>(breakInterval)
  const [intervalCountValue, setIntervalCountValue] = useState<number>(intervalCount)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Если профиль/настройки обновились снаружи (после загрузки или сохранения),
  // синхронизируем отображение, чтобы чекбокс/поля не "съезжали".
  useEffect(() => {
    if (saving) return
    setNotify(notificationsEnabled)
  }, [notificationsEnabled, saving])

  useEffect(() => {
    if (saving) return
    setEmailValue(email)
  }, [email, saving])

  useEffect(() => {
    if (saving) return
    setNameValue(name)
  }, [name, saving])

  useEffect(() => {
    if (saving) return
    setWorkIntervalValue(workInterval)
  }, [workInterval, saving])

  useEffect(() => {
    if (saving) return
    setBreakIntervalValue(breakInterval)
  }, [breakInterval, saving])

  useEffect(() => {
    if (saving) return
    setIntervalCountValue(intervalCount)
  }, [intervalCount, saving])

  const handleSave = async () => {
    const normalizedEmail = emailValue.trim()
    const normalizedName = nameValue.trim()

    if (!normalizedEmail.includes('@')) {
      setError('Укажите корректный email')
      return
    }
    if (passwordValue.length < 6) {
      setError('Пароль должен содержать минимум 6 символов')
      return
    }
    if (!Number.isFinite(workIntervalValue) || workIntervalValue < 1) {
      setError('workInterval должен быть не меньше 1')
      return
    }
    if (!Number.isFinite(breakIntervalValue) || breakIntervalValue < 1) {
      setError('breakInterval должен быть не меньше 1')
      return
    }
    if (
      !Number.isFinite(intervalCountValue) ||
      intervalCountValue < 1 ||
      intervalCountValue > 10
    ) {
      setError('intervalCount должен быть от 1 до 10')
      return
    }

    setError(null)
    setSaving(true)
    try {
      await onSave({
        notificationsEnabled: notify,
        email: normalizedEmail,
        password: passwordValue,
        name: normalizedName || undefined,
        workInterval: workIntervalValue,
        breakInterval: breakIntervalValue,
        intervalCount: intervalCountValue,
      })
      // eslint-disable-next-line no-alert
      alert('Профиль и настройки сохранены')
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Ошибка сохранения')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className='page'>
      <h2 className='page-title'>⚙️ Настройки профиля</h2>

      <div className='settings-group'>
        <div className='setting-row'>
          <input
            type='checkbox'
            id='notifyCheck'
            checked={notify}
            onChange={(e) => setNotify(e.target.checked)}
          />
          <label htmlFor='notifyCheck'>
            Уведомления о раундах ({notify ? 'включены' : 'выключены'})
          </label>
        </div>

        <div className='setting-row setting-column'>
          <label htmlFor='profileEmail'>Email (обязательно)</label>
          <input
            type='email'
            id='profileEmail'
            className='task-input'
            value={emailValue}
            onChange={(e) => setEmailValue(e.target.value)}
          />
        </div>

        <div className='setting-row setting-column'>
          <label htmlFor='profilePassword'>Пароль (обязательно)</label>
          <input
            type='password'
            id='profilePassword'
            className='task-input'
            value={passwordValue}
            onChange={(e) => setPasswordValue(e.target.value)}
            placeholder='Минимум 6 символов'
          />
        </div>

        <div className='setting-row setting-column'>
          <label htmlFor='profileName'>Имя (опционально)</label>
          <input
            type='text'
            id='profileName'
            className='task-input'
            value={nameValue}
            onChange={(e) => setNameValue(e.target.value)}
          />
        </div>

        <div className='setting-row'>
          <label htmlFor='workInterval'>Work interval (мин):</label>
          <input
            type='number'
            id='workInterval'
            min={1}
            value={workIntervalValue}
            onChange={(e) => setWorkIntervalValue(Number(e.target.value))}
          />
        </div>

        <div className='setting-row'>
          <label htmlFor='breakInterval'>Break interval (мин):</label>
          <input
            type='number'
            id='breakInterval'
            min={1}
            value={breakIntervalValue}
            onChange={(e) => setBreakIntervalValue(Number(e.target.value))}
          />
        </div>

        <div className='setting-row'>
          <label htmlFor='intervalCount'>Количество интервалов:</label>
          <input
            type='number'
            id='intervalCount'
            min={1}
            max={10}
            value={intervalCountValue}
            onChange={(e) => setIntervalCountValue(Number(e.target.value))}
          />
        </div>

        {error && <div className='form-error'>{error}</div>}

        <button className='save-settings' onClick={() => void handleSave()} disabled={saving}>
          {saving ? 'Сохранение...' : 'Сохранить профиль'}
        </button>
      </div>
    </div>
  )
}

