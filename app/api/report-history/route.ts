import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// Define the status type to match the enum in schema
type ReportStatus = 'completed' | 'generating' | 'failed'

// Define the report type that matches our schema
interface ReportHistoryType {
  id: number
  reportType: string
  reportName: string
  amount: number
  status: ReportStatus
  generatedAt: Date
  pdfUrl?: string | null
  error?: string | null
  metadata?: any
  userId: number
  user: {
    id: number
    name: string
    email: string
    phoneNumber: string
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { 
      reportType,
      reportName,
      amount,
      userId,
      status = "completed",
      pdfUrl,
      error,
      metadata
    } = body

    // Validate required fields
    if (!reportType || !userId || !amount) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      )
    }

    // Create report history entry
    const report = await db.reportHistory.create({
      data: {
        reportType,
        reportName,
        amount,
        status,
        userId,
        ...(pdfUrl && { pdfUrl }),
        ...(error && { error }),
        ...(metadata && { metadata })
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    })

    return NextResponse.json({ success: true, data: report })
  } catch (error) {
    console.error("[REPORT_HISTORY_POST]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
}

export async function GET(req: Request) {
  try {
    // Get all reports with user details
    const reports = await db.reportHistory.findMany({
      orderBy: {
        generatedAt: 'desc'
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            phoneNumber: true
          }
        }
      }
    })

    // Transform the data to include user name
    const formattedReports = reports.map((report) => {
      // Cast the report to our type
      const typedReport = {
        ...report,
        status: report.status as ReportStatus
      } as ReportHistoryType

      return {
        id: typedReport.id.toString(),
        type: typedReport.reportType,
        generatedAt: typedReport.generatedAt,
        status: typedReport.status,
        cost: typedReport.amount,
        generatedBy: typedReport.user.name,
        userId: typedReport.userId,
        userEmail: typedReport.user.email,
        userPhone: typedReport.user.phoneNumber,
        ...(typedReport.pdfUrl && { pdfUrl: typedReport.pdfUrl }),
        ...(typedReport.error && { error: typedReport.error }),
        ...(typedReport.metadata && { metadata: typedReport.metadata })
      }
    })

    return NextResponse.json({ success: true, data: formattedReports })
  } catch (error) {
    console.error("[REPORT_HISTORY_GET]", error)
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    )
  }
} 