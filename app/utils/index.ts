import type { ClassValue } from 'clsx'

import {  clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Fisher–Yates shuffle — 完全随机
 */
export function shuffle<T>(arr: T[]): T[] {
  const copy = [...arr]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[copy[i], copy[j]] = [copy[j] as T, copy[i] as T]
  }
  return copy
}

/**
 *  延时
 * @param ms
 * @returns
 */
export function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms))
}
