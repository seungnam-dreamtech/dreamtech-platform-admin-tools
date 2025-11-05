// 공통 스타일 정의

// 공통 스타일 정의
import type {CSSProperties} from 'react';
import { SCROLL_HEIGHTS, THEME_COLORS } from '../constants/gateway';

export const commonStyles = {
  // 레이아웃
  fullWidth: { width: '100%' } as CSSProperties,
  flexCenter: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  } as CSSProperties,
  flexBetween: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
  } as CSSProperties,

  // 스크롤
  scrollable: (maxHeight: string = SCROLL_HEIGHTS.MEDIUM): CSSProperties => ({
    maxHeight,
    overflowY: 'auto',
  }),

  // 텍스트
  textSecondary: { color: THEME_COLORS.TEXT_SECONDARY } as CSSProperties,
  textTertiary: { color: THEME_COLORS.TEXT_TERTIARY } as CSSProperties,
  textCenter: { textAlign: 'center' } as CSSProperties,


  // 간격
  marginBottom: (size: number = 16): CSSProperties => ({ marginBottom: size }),
  marginTop: (size: number = 16): CSSProperties => ({ marginTop: size }),
  padding: (size: number = 16): CSSProperties => ({ padding: size }),

  // 배경
  backgroundGray: { backgroundColor: '#fafafa' } as CSSProperties,
  backgroundLight: { backgroundColor: '#f8f9fa' } as CSSProperties,
  backgroundSuccess: { backgroundColor: '#f6ffed' } as CSSProperties,

  // 빈 상태 표시
  emptyState: {
    textAlign: 'center' as const,
    padding: '60px 0',
    color: THEME_COLORS.TEXT_SECONDARY,
  } as CSSProperties,

  // 카드 스타일
  cardSmall: { marginBottom: 16, backgroundColor: '#fafafa' } as CSSProperties,
} as const;
