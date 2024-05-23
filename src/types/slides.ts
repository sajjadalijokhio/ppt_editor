import type { BarChartOptions, LineChartOptions, PieChartOptions } from 'chartist'

export const enum ShapePathFormulasKeys {
  ROUND_RECT = 'roundRect',
  ROUND_RECT_DIAGONAL = 'roundRectDiagonal',
  ROUND_RECT_SINGLE = 'roundRectSingle',
  ROUND_RECT_SAMESIDE = 'roundRectSameSide',
  CUT_RECT_DIAGONAL = 'cutRectDiagonal',
  CUT_RECT_SINGLE = 'cutRectSingle',
  CUT_RECT_SAMESIDE = 'cutRectSameSide',
  CUT_ROUND_RECT = 'cutRoundRect',
  MESSAGE = 'message',
  ROUND_MESSAGE = 'roundMessage',
  L = 'L',
  RING_RECT = 'ringRect',
  PLUS = 'plus',
  TRIANGLE = 'triangle',
  PARALLELOGRAM_LEFT = 'parallelogramLeft',
  PARALLELOGRAM_RIGHT = 'parallelogramRight',
  TRAPEZOID = 'trapezoid',
  BULLET = 'bullet',
  INDICATOR = 'indicator',
}

export const enum ElementTypes {
  TEXT = 'text',
  IMAGE = 'image',
  SHAPE = 'shape',
  LINE = 'line',
  CHART = 'chart',
  TABLE = 'table',
  LATEX = 'latex',
  VIDEO = 'video',
  AUDIO = 'audio',
}


export interface PPTElementShadow {
  h: number
  v: number
  blur: number
  color: string
}

export interface PPTElementOutline {
  style?: 'dashed' | 'solid'
  width?: number
  color?: string
}

export interface PPTElementLink {
  type: 'web' | 'slide'
  target: string
}

interface PPTBaseElement {
  id: string
  left: number
  top: number
  lock?: boolean
  groupId?: string
  width: number
  height: number
  rotate: number
  link?: PPTElementLink
  name?: string
}

export interface PPTTextElement extends PPTBaseElement {
  type: 'text'
  content: string
  defaultFontName: string
  defaultColor: string
  outline?: PPTElementOutline
  fill?: string
  lineHeight?: number
  wordSpace?: number
  opacity?: number
  shadow?: PPTElementShadow
  paragraphSpace?: number
  vertical?: boolean
}

export interface ImageOrShapeFlip {
  flipH?: boolean
  flipV?: boolean
}

export type ImageElementFilterKeys = 'blur' | 'brightness' | 'contrast' | 'grayscale' | 'saturate' | 'hue-rotate' | 'opacity'
export interface ImageElementFilters {
  'blur'?: string
  'brightness'?: string
  'contrast'?: string
  'grayscale'?: string
  'saturate'?: string
  'hue-rotate'?: string
  'opacity'?: string
}

export type ImageClipDataRange = [[number, number], [number, number]]

export interface ImageElementClip {
  range: ImageClipDataRange
  shape: string
}

export interface PPTImageElement extends PPTBaseElement {
  type: 'image'
  fixedRatio: boolean
  src: string
  outline?: PPTElementOutline
  filters?: ImageElementFilters
  clip?: ImageElementClip
  flipH?: boolean
  flipV?: boolean
  shadow?: PPTElementShadow
  colorMask?: string
}

export interface ShapeGradient {
  type: 'linear' | 'radial'
  color: [string, string]
  rotate: number
}

export type ShapeTextAlign = 'top' | 'middle' | 'bottom' 

export interface ShapeText {
  content: string
  defaultFontName: string
  defaultColor: string
  align: ShapeTextAlign
}

export interface PPTShapeElement extends PPTBaseElement {
  type: 'shape'
  viewBox: [number, number]
  path: string
  fixedRatio: boolean
  fill: string
  gradient?: ShapeGradient
  outline?: PPTElementOutline
  opacity?: number
  flipH?: boolean
  flipV?: boolean
  shadow?: PPTElementShadow
  special?: boolean
  text?: ShapeText
  pathFormula?: ShapePathFormulasKeys
  keypoint?: number
}


export type LinePoint = '' | 'arrow' | 'dot' 

export interface PPTLineElement extends Omit<PPTBaseElement, 'height' | 'rotate'> {
  type: 'line'
  start: [number, number]
  end: [number, number]
  style: 'solid' | 'dashed'
  color: string
  points: [LinePoint, LinePoint]
  shadow?: PPTElementShadow
  broken?: [number, number]
  curve?: [number, number]
  cubic?: [[number, number], [number, number]]
}


export type PresetChartType = 'bar' | 'horizontalBar' | 'line' | 'area' | 'scatter' | 'pie' | 'ring'
export type ChartType = 'bar' | 'line' | 'pie'
export type ChartOptions = LineChartOptions & BarChartOptions & PieChartOptions
export interface ChartData {
  labels: string[]
  legends: string[]
  series: number[][]
}

export interface PPTChartElement extends PPTBaseElement {
  type: 'chart'
  fill?: string
  chartType: ChartType
  data: ChartData
  options?: ChartOptions
  outline?: PPTElementOutline
  themeColor: string[]
  gridColor?: string
  legend?: '' | 'top' | 'bottom'
}

export interface TableCellStyle {
  bold?: boolean
  em?: boolean
  underline?: boolean
  strikethrough?: boolean
  color?: string
  backcolor?: string
  fontsize?: string
  fontname?: string
  align?: 'left' | 'center' | 'right' | 'justify'
}

export interface TableCell {
  id: string
  colspan: number
  rowspan: number
  text: string
  style?: TableCellStyle
}

export interface TableTheme {
  color: string
  rowHeader: boolean
  rowFooter: boolean
  colHeader: boolean
  colFooter: boolean
}

export interface PPTTableElement extends PPTBaseElement {
  type: 'table'
  outline: PPTElementOutline
  theme?: TableTheme
  colWidths: number[]
  cellMinHeight: number
  data: TableCell[][]
}

export interface PPTLatexElement extends PPTBaseElement {
  type: 'latex'
  latex: string
  path: string
  color: string
  strokeWidth: number
  viewBox: [number, number]
  fixedRatio: boolean
}

export interface PPTVideoElement extends PPTBaseElement {
  type: 'video'
  src: string
  autoplay: boolean
  poster?: string
  ext?: string
}

export interface PPTAudioElement extends PPTBaseElement {
  type: 'audio'
  fixedRatio: boolean
  color: string
  loop: boolean
  autoplay: boolean
  src: string
  ext?: string
}


export type PPTElement = PPTTextElement | PPTImageElement | PPTShapeElement | PPTLineElement | PPTChartElement | PPTTableElement | PPTLatexElement | PPTVideoElement | PPTAudioElement

export interface PPTAnimation {
  id: string
  elId: string
  effect: string
  type: 'in' | 'out' | 'attention'
  duration: number
  trigger: 'click' | 'meantime' | 'auto'
}

export interface SlideBackground {
  type: 'solid' | 'image' | 'gradient'
  color?: string
  image?: string
  imageSize?: 'cover' | 'contain' | 'repeat'
  gradientType?: 'linear' | 'radial'
  gradientColor?: [string, string]
  gradientRotate?: number
}


export type TurningMode = 'no' | 'fade' | 'slideX' | 'slideY' | 'random' | 'slideX3D' | 'slideY3D' | 'rotate' | 'scaleY' | 'scaleX' | 'scale' | 'scaleReverse'

export interface NoteReply {
  id: string
  content: string
  time: number
  user: string
}

export interface Note {
  id: string
  content: string
  time: number
  user: string
  elId?: string
  replies?: NoteReply[]
}

export interface Slide {
  id: string
  elements: PPTElement[]
  notes?: Note[]
  remark?: string
  background?: SlideBackground
  animations?: PPTAnimation[]
  turningMode?: TurningMode
}

export interface SlideTheme {
  backgroundColor: string
  themeColor: string
  fontColor: string
  fontName: string
  outline: PPTElementOutline
  shadow: PPTElementShadow
}
