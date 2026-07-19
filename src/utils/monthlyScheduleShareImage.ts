import {
  MONTHLY_MUSIC_REPERTOIRE_SLOTS,
  buildCellAssignmentKey,
  buildRepertoireCellKey,
  formatMonthYearLabel,
  formatScheduleEventLabel,
  type MonthlyScheduleCellAssignment,
  type MonthlyScheduleColumn,
  type MonthlyScheduleRepertoireCell,
  type MonthlyScheduleRepertoireGroupCell,
  type ScheduleEventItem
} from '@/utils/monthlySchedule'

const COLORS = {
  primary: '#2f557f',
  primarySoft: '#e8eef4',
  text: '#1a2b3c',
  muted: '#5c6f82',
  border: '#d7e0ea',
  surface: '#ffffff',
  surfaceMuted: '#f3f6f9',
  headerBg: '#2f557f',
  headerText: '#ffffff'
} as const

const LAYOUT = {
  width: 1200,
  paddingX: 36,
  paddingY: 32,
  titleGap: 8,
  sectionGap: 28,
  tableGap: 12,
  rowMinHeight: 44,
  headerRowHeight: 40,
  cellPaddingX: 10,
  cellPaddingY: 8,
  lineHeight: 18,
  fontFamily: '"Noto Sans", "Segoe UI", sans-serif',
  headingFamily: '"Advent Sans", "Noto Sans", "Segoe UI", sans-serif'
} as const

export type MonthlyScheduleShareImageInput = {
  ministryName: string
  year: number
  month: number
  events: ScheduleEventItem[]
  columns: MonthlyScheduleColumn[]
  assignments: Record<string, MonthlyScheduleCellAssignment>
  includeRepertoire: boolean
  repertoires: Record<string, MonthlyScheduleRepertoireCell>
  repertoireGroups: Record<number, MonthlyScheduleRepertoireGroupCell>
}

type TableModel = {
  title: string
  headers: string[]
  rows: string[][]
  columnWeights: number[]
}

function wrapText(
  ctx: CanvasRenderingContext2D,
  text: string,
  maxWidth: number
): string[] {
  const normalized = text.trim() || '—'

  if (maxWidth <= 0) {
    return [normalized]
  }

  const words = normalized.split(/\s+/)
  const lines: string[] = []
  let current = ''

  words.forEach((word) => {
    const candidate = current ? `${current} ${word}` : word
    const width = ctx.measureText(candidate).width

    if (width <= maxWidth || !current) {
      current = candidate
      return
    }

    lines.push(current)
    current = word
  })

  if (current) {
    lines.push(current)
  }

  return lines.length > 0 ? lines : ['—']
}

function getUsedAssignmentColumns(
  events: ScheduleEventItem[],
  columns: MonthlyScheduleColumn[],
  assignments: Record<string, MonthlyScheduleCellAssignment>
): MonthlyScheduleColumn[] {
  return columns.filter((column) =>
    events.some((event) => {
      const key = buildCellAssignmentKey(event.eventId, column.id)
      return Boolean(assignments[key])
    })
  )
}

function buildAssignmentTable(
  events: ScheduleEventItem[],
  columns: MonthlyScheduleColumn[],
  assignments: Record<string, MonthlyScheduleCellAssignment>
): TableModel {
  const usedColumns = getUsedAssignmentColumns(events, columns, assignments)
  const headers = [
    'Evento',
    ...usedColumns.map((_, index) => `Pessoa ${index + 1}`)
  ]

  if (usedColumns.length === 0) {
    return {
      title: 'Escala',
      headers: ['Evento', 'Equipe'],
      rows: events.map((event) => [
        formatScheduleEventLabel(event, { includeTime: false }),
        'Nenhuma pessoa definida'
      ]),
      columnWeights: [1.4, 2]
    }
  }

  const rows = events.map((event) => {
    const cells = usedColumns.map((column) => {
      const assignment = assignments[buildCellAssignmentKey(event.eventId, column.id)]

      if (!assignment) {
        return ''
      }

      if (assignment.skillName) {
        return `${assignment.personName}\n${assignment.skillName}`
      }

      return assignment.personName
    })

    return [
      formatScheduleEventLabel(event, { includeTime: false }),
      ...cells
    ]
  })

  return {
    title: 'Escala',
    headers,
    rows,
    columnWeights: [1.6, ...usedColumns.map(() => 1)]
  }
}

function getUsedRepertoireSlotOrders(
  events: ScheduleEventItem[],
  repertoires: Record<string, MonthlyScheduleRepertoireCell>
): number[] {
  return MONTHLY_MUSIC_REPERTOIRE_SLOTS
    .map((slot) => slot.displayOrder)
    .filter((displayOrder) =>
      events.some((event) => {
        const key = buildRepertoireCellKey(event.eventId, displayOrder)
        return Boolean(repertoires[key])
      })
    )
}

function buildRepertoireTable(
  events: ScheduleEventItem[],
  repertoires: Record<string, MonthlyScheduleRepertoireCell>,
  repertoireGroups: Record<number, MonthlyScheduleRepertoireGroupCell>
): TableModel {
  const usedOrders = getUsedRepertoireSlotOrders(events, repertoires)
  const hasFolder = events.some((event) => Boolean(repertoireGroups[event.eventId]))
  const slotLabels = usedOrders.map((displayOrder) => {
    const slot = MONTHLY_MUSIC_REPERTOIRE_SLOTS.find((item) => item.displayOrder === displayOrder)
    return slot?.label ?? `Slot ${displayOrder + 1}`
  })

  const headers = [
    'Evento',
    ...slotLabels,
    ...(hasFolder ? ['Pasta'] : [])
  ]

  if (usedOrders.length === 0 && !hasFolder) {
    return {
      title: 'Repertório',
      headers: ['Evento', 'Músicas'],
      rows: events.map((event) => [
        formatScheduleEventLabel(event, { includeTime: false }),
        'Nenhuma música definida'
      ]),
      columnWeights: [1.4, 2]
    }
  }

  const rows = events.map((event) => {
    const folder = repertoireGroups[event.eventId]
    const slotCells = usedOrders.map((displayOrder) => {
      if (folder) {
        return ''
      }

      const repertoire = repertoires[buildRepertoireCellKey(event.eventId, displayOrder)]

      if (!repertoire) {
        return ''
      }

      return repertoire.songName
    })

    return [
      formatScheduleEventLabel(event, { includeTime: false }),
      ...slotCells,
      ...(hasFolder ? [folder?.repertoireGroupName ?? ''] : [])
    ]
  })

  return {
    title: 'Repertório',
    headers,
    rows,
    columnWeights: [
      1.5,
      ...usedOrders.map(() => 1),
      ...(hasFolder ? [1.1] : [])
    ]
  }
}

function resolveColumnWidths(
  weights: number[],
  totalWidth: number
): number[] {
  const sum = weights.reduce((acc, weight) => acc + weight, 0)

  return weights.map((weight) => (weight / sum) * totalWidth)
}

function measureTableHeight(
  ctx: CanvasRenderingContext2D,
  table: TableModel,
  columnWidths: number[]
): number {
  let height = LAYOUT.headerRowHeight

  table.rows.forEach((row) => {
    let maxLines = 1

    row.forEach((cell, index) => {
      const maxWidth = columnWidths[index] - LAYOUT.cellPaddingX * 2
      const parts = cell.split('\n')

      if (parts.length === 1 && parts[0].trim() === '') {
        return
      }

      const lines = parts.flatMap((part) => wrapText(ctx, part, maxWidth))
      maxLines = Math.max(maxLines, lines.length)
    })

    height += Math.max(
      LAYOUT.rowMinHeight,
      maxLines * LAYOUT.lineHeight + LAYOUT.cellPaddingY * 2
    )
  })

  return height
}

function drawRoundedRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
): void {
  const r = Math.min(radius, width / 2, height / 2)
  ctx.beginPath()
  ctx.moveTo(x + r, y)
  ctx.arcTo(x + width, y, x + width, y + height, r)
  ctx.arcTo(x + width, y + height, x, y + height, r)
  ctx.arcTo(x, y + height, x, y, r)
  ctx.arcTo(x, y, x + width, y, r)
  ctx.closePath()
}

function drawTable(
  ctx: CanvasRenderingContext2D,
  table: TableModel,
  x: number,
  y: number,
  tableWidth: number
): number {
  const columnWidths = resolveColumnWidths(table.columnWeights, tableWidth)
  ctx.font = `700 13px ${LAYOUT.fontFamily}`
  const tableHeight = measureTableHeight(ctx, table, columnWidths)

  ctx.fillStyle = COLORS.surface
  ctx.strokeStyle = COLORS.border
  ctx.lineWidth = 1
  ctx.fillRect(x, y, tableWidth, tableHeight)
  ctx.strokeRect(x, y, tableWidth, tableHeight)

  let cursorY = y

  ctx.fillStyle = COLORS.headerBg
  ctx.fillRect(x, cursorY, tableWidth, LAYOUT.headerRowHeight)

  let cursorX = x
  ctx.fillStyle = COLORS.headerText
  ctx.font = `700 12px ${LAYOUT.fontFamily}`
  ctx.textBaseline = 'middle'

  table.headers.forEach((header, index) => {
    const width = columnWidths[index]
    const lines = wrapText(ctx, header.toUpperCase(), width - LAYOUT.cellPaddingX * 2)
    const textY = cursorY + LAYOUT.headerRowHeight / 2
      - ((lines.length - 1) * LAYOUT.lineHeight) / 2

    lines.forEach((line, lineIndex) => {
      ctx.fillText(line, cursorX + LAYOUT.cellPaddingX, textY + lineIndex * LAYOUT.lineHeight)
    })

    cursorX += width
  })

  cursorY += LAYOUT.headerRowHeight

  table.rows.forEach((row, rowIndex) => {
    ctx.font = `400 13px ${LAYOUT.fontFamily}`

    const wrappedCells = row.map((cell, index) => {
      const maxWidth = columnWidths[index] - LAYOUT.cellPaddingX * 2
      const parts = cell.split('\n')

      if (parts.length === 1 && parts[0].trim() === '') {
        return ['']
      }

      return parts.flatMap((part) => wrapText(ctx, part, maxWidth))
    })

    const maxLines = Math.max(1, ...wrappedCells.map((lines) => lines.length || 1))
    const rowHeight = Math.max(
      LAYOUT.rowMinHeight,
      maxLines * LAYOUT.lineHeight + LAYOUT.cellPaddingY * 2
    )

    if (rowIndex % 2 === 1) {
      ctx.fillStyle = COLORS.surfaceMuted
      ctx.fillRect(x, cursorY, tableWidth, rowHeight)
    }

    cursorX = x
    ctx.textBaseline = 'top'

    wrappedCells.forEach((lines, index) => {
      const width = columnWidths[index]
      const textY = cursorY + LAYOUT.cellPaddingY

      lines.forEach((line, lineIndex) => {
        if (!line) {
          return
        }

        const isSecondary = lineIndex > 0
        ctx.fillStyle = isSecondary ? COLORS.muted : COLORS.text
        ctx.font = isSecondary
          ? `400 12px ${LAYOUT.fontFamily}`
          : `600 13px ${LAYOUT.fontFamily}`
        ctx.fillText(line, cursorX + LAYOUT.cellPaddingX, textY + lineIndex * LAYOUT.lineHeight)
      })

      cursorX += width
    })

    ctx.strokeStyle = COLORS.border
    ctx.beginPath()
    ctx.moveTo(x, cursorY + rowHeight)
    ctx.lineTo(x + tableWidth, cursorY + rowHeight)
    ctx.stroke()

    cursorY += rowHeight
  })

  cursorX = x
  for (let index = 1; index < columnWidths.length; index += 1) {
    cursorX += columnWidths[index - 1]
    ctx.beginPath()
    ctx.moveTo(cursorX, y)
    ctx.lineTo(cursorX, y + tableHeight)
    ctx.stroke()
  }

  return tableHeight
}

function slugifyFilenamePart(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48) || 'escala'
}

export function buildMonthlyScheduleShareFilename(
  ministryName: string,
  year: number,
  month: number
): string {
  const monthLabel = formatMonthYearLabel(year, month)
  return `escala-${slugifyFilenamePart(ministryName)}-${slugifyFilenamePart(monthLabel)}.png`
}

export function downloadBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  anchor.href = url
  anchor.download = filename
  anchor.rel = 'noopener'
  document.body.appendChild(anchor)
  anchor.click()
  anchor.remove()
  URL.revokeObjectURL(url)
}

export async function buildMonthlyScheduleShareImageBlob(
  input: MonthlyScheduleShareImageInput
): Promise<Blob> {
  if (typeof document !== 'undefined' && document.fonts?.ready) {
    await document.fonts.ready
  }

  const canvas = document.createElement('canvas')
  const ctx = canvas.getContext('2d')

  if (!ctx) {
    throw new Error('Não foi possível criar o contexto de desenho da imagem.')
  }

  const tableWidth = LAYOUT.width - LAYOUT.paddingX * 2
  const assignmentTable = buildAssignmentTable(
    input.events,
    input.columns,
    input.assignments
  )
  const repertoireTable = input.includeRepertoire
    ? buildRepertoireTable(input.events, input.repertoires, input.repertoireGroups)
    : null

  ctx.font = `700 13px ${LAYOUT.fontFamily}`
  const assignmentColumnWidths = resolveColumnWidths(assignmentTable.columnWeights, tableWidth)
  const assignmentHeight = measureTableHeight(ctx, assignmentTable, assignmentColumnWidths)

  let repertoireHeight = 0
  if (repertoireTable) {
    const repertoireColumnWidths = resolveColumnWidths(repertoireTable.columnWeights, tableWidth)
    repertoireHeight = measureTableHeight(ctx, repertoireTable, repertoireColumnWidths)
  }

  const headerBlockHeight = 96
  const contentHeight = headerBlockHeight
    + 24
    + assignmentHeight
    + (repertoireTable
      ? LAYOUT.sectionGap + 24 + repertoireHeight
      : 0)
    + LAYOUT.paddingY

  canvas.width = LAYOUT.width
  canvas.height = LAYOUT.paddingY + contentHeight

  // Background
  ctx.fillStyle = COLORS.surfaceMuted
  ctx.fillRect(0, 0, canvas.width, canvas.height)

  ctx.fillStyle = COLORS.surface
  drawRoundedRect(
    ctx,
    LAYOUT.paddingX - 16,
    LAYOUT.paddingY - 12,
    tableWidth + 32,
    contentHeight + 8,
    0
  )
  ctx.fill()
  ctx.strokeStyle = COLORS.border
  ctx.stroke()

  let cursorY = LAYOUT.paddingY

  // Brand / title
  ctx.fillStyle = COLORS.primary
  ctx.font = `400 14px ${LAYOUT.headingFamily}`
  ctx.textBaseline = 'top'
  ctx.fillText('BLESS APP', LAYOUT.paddingX, cursorY)

  cursorY += 22
  const monthYearLabel = formatMonthYearLabel(input.year, input.month)
  const title = `Escala do mês de ${monthYearLabel}`

  ctx.fillStyle = COLORS.text
  ctx.font = `400 28px ${LAYOUT.headingFamily}`
  ctx.fillText(title, LAYOUT.paddingX, cursorY)

  cursorY += 36
  if (input.ministryName) {
    ctx.fillStyle = COLORS.muted
    ctx.font = `600 16px ${LAYOUT.fontFamily}`
    ctx.fillText(input.ministryName, LAYOUT.paddingX, cursorY)
    cursorY += 38
  } else {
    cursorY += 16
  }

  // Assignment section
  ctx.fillStyle = COLORS.primary
  ctx.font = `700 14px ${LAYOUT.fontFamily}`
  ctx.fillText(assignmentTable.title.toUpperCase(), LAYOUT.paddingX, cursorY)
  cursorY += 22

  cursorY += drawTable(ctx, assignmentTable, LAYOUT.paddingX, cursorY, tableWidth)

  if (repertoireTable) {
    cursorY += LAYOUT.sectionGap
    ctx.fillStyle = COLORS.primary
    ctx.font = `700 14px ${LAYOUT.fontFamily}`
    ctx.fillText(repertoireTable.title.toUpperCase(), LAYOUT.paddingX, cursorY)
    cursorY += 22
    drawTable(ctx, repertoireTable, LAYOUT.paddingX, cursorY, tableWidth)
  }

  // Footer
  ctx.fillStyle = COLORS.muted
  ctx.font = `400 11px ${LAYOUT.fontFamily}`
  ctx.textBaseline = 'bottom'
  ctx.fillText(
    'Gerado pelo Bless App para compartilhamento',
    LAYOUT.paddingX,
    canvas.height - 10
  )

  return await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        reject(new Error('Não foi possível gerar a imagem da escala.'))
        return
      }

      resolve(blob)
    }, 'image/png')
  })
}

export async function copyImageBlobToClipboard(blob: Blob): Promise<boolean> {
  if (!navigator.clipboard || typeof ClipboardItem === 'undefined') {
    return false
  }

  try {
    await navigator.clipboard.write([
      new ClipboardItem({
        [blob.type]: blob
      })
    ])
    return true
  } catch {
    return false
  }
}
