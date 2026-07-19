import { formatDateOnly } from '@/utils/eventCalendar'

const STORAGE_PREFIX = 'batelms.birthdays.shown.'

export function getTodayBirthdayKey(): string {
  return formatDateOnly(new Date())
}

export function wasBirthdayGreetingShown(dateKey = getTodayBirthdayKey()): boolean {
  return localStorage.getItem(`${STORAGE_PREFIX}${dateKey}`) === '1'
}

export function markBirthdayGreetingShown(dateKey = getTodayBirthdayKey()): void {
  localStorage.setItem(`${STORAGE_PREFIX}${dateKey}`, '1')
}
