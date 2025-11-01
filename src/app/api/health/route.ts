import { NextResponse } from "next/server";
import { db } from "@/server/db";
import { auth } from "@/server/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Test database connection
    await db.$queryRaw`SELECT 1`;
    const dbStatus = "connected";
    
    // Test authentication
    const session = await auth();
    const authStatus = session ? "authenticated" : "unauthenticated";
    
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return NextResponse.json({
      status: "healthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: {
          status: dbStatus,
          responseTime: `${responseTime}ms`,
        },
        authentication: {
          status: authStatus,
          hasSession: !!session,
        },
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXTAUTH_URL: process.env.NEXTAUTH_URL ? "configured" : "missing",
        DATABASE_URL: process.env.DATABASE_URL ? "configured" : "missing",
        OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY ? "configured" : "missing",
      },
    }, { status: 200 });
    
  } catch (error) {
    const endTime = Date.now();
    const responseTime = endTime - startTime;
    
    return NextResponse.json({
      status: "unhealthy",
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : "Unknown error",
      services: {
        database: {
          status: "error",
          error: error instanceof Error ? error.message : "Connection failed",
        },
      },
    }, { status: 503 });
  }
}
