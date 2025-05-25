import { NextResponse } from "next/server"
import { getBusinesses } from "@/app/actions/business-actions"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search") || undefined
    const business_type = searchParams.get("business_type") || undefined
    const region = searchParams.get("region") || undefined
    const city = searchParams.get("city") || undefined
    const order_by = searchParams.get("order_by") || undefined
    const page = searchParams.get("page") || undefined
    const page_size = searchParams.get("page_size") || undefined

    const businesses = await getBusinesses({
      search,
      business_type,
      region,
      city,
      order_by,
      page,
      page_size,
    })

    return NextResponse.json(businesses)
  } catch (error) {
    console.error("Error in business API:", error)
    return NextResponse.json({ error: "Failed to fetch businesses" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    // Parse the request body
    const data = await request.json()

    // Log the received data for debugging
    console.log("Received business data in API route:", data)

    // Forward the request to the backend API
    const headers = new Headers(request.headers)

    // Make sure we have the right content type
    headers.set("Content-Type", "application/json")

    // Forward the request to the backend API
    const backendResponse = await fetch("https://ai-driven-travel.onrender.com/api/business/businesses/", {
      method: "POST",
      headers,
      body: JSON.stringify(data),
    })

    // Get the response data
    const responseData = await backendResponse.json()

    // Return the response with the same status code
    return NextResponse.json(responseData, { status: backendResponse.status })
  } catch (error) {
    console.error("Error in business API:", error)
    return NextResponse.json({ error: "Failed to create business" }, { status: 500 })
  }
}
