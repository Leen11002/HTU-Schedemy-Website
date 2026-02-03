import { NextResponse } from 'next/server';
import { SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"; 

const sqsClient = new SQSClient({ region: "us-east-1" });

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // 1. Send to SQS (Reliability Layer)
    // We do this first so even if the fetch fails, the data is saved in the queue
    try {
      const sqsCommand = new SendMessageCommand({
        QueueUrl: process.env.NEXT_PUBLIC_SQS_URL || "https://sqs.us-east-1.amazonaws.com/285392455355/htuschedemyqueue",
        MessageBody: JSON.stringify(body),
      });
      await sqsClient.send(sqsCommand);
      console.log("Backup saved to SQS");
    } catch (sqsErr) {
      console.error("SQS Backup Failed:", sqsErr);
      // We don't throw here so the main fetch can still try to run
    }

    // 2. Original Fetch to your Backend
    const res = await fetch('http://htuschedemy.htufolio.com/email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      throw new Error(`Backend failed. Status: ${res.status}`);
    }

    const data = await res.json().catch(() => res.text());
    return NextResponse.json(data, { status: 200 });

  } catch (error: any) {
    console.error('Error in email route:', error);
    return NextResponse.json({ error: 'Failed to process request', details: error.message }, { status: 500 });
  }
}