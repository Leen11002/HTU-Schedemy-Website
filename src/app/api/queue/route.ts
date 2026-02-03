import {SQSClient, SendMessageCommand } from "@aws-sdk/client-sqs"; 
import {NextResponse} from "next/server"; 
const sqsClient = new SQSClient({ region: "us-east-1" }); 

export async function POST(request: Request) {
  const body = await request.json();

  const command = new SendMessageCommand({
    QueueUrl: "https://sqs.us-east-1.amazonaws.com/285392455355/htuschedemyqueue",
    MessageBody: JSON.stringify(body),
  });

  try {
    await sqsClient.send(command);
    return NextResponse.json({ message: "Success: Sent to SQS" });
  } catch (error) {
    console.error("SQS Error:", error);
    return NextResponse.json({ error: "Failed to send message" }, { status: 500 });
  }
}