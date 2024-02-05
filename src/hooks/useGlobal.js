'use client'
import { MapContext } from '@/provider/MapContext'
import { useContext } from 'react'

export const useGlobal = () => useContext(MapContext)