import { getActiveWebhooks } from "./db"

// Send a notification to Slack
export async function sendSlackNotification(message: string, event = "update") {
  try {
    // Get all active webhooks that are subscribed to this event
    const webhooks = await getActiveWebhooks()
    const relevantWebhooks = webhooks.filter((webhook) => webhook.events.includes(event))

    if (relevantWebhooks.length === 0) {
      console.log("No active webhooks found for event:", event)
      return
    }

    // Send the notification to each webhook
    const promises = relevantWebhooks.map(async (webhook) => {
      try {
        const response = await fetch(webhook.url, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text: message }),
        })

        if (!response.ok) {
          throw new Error(`Failed to send notification to ${webhook.name}: ${response.statusText}`)
        }

        console.log(`Notification sent to ${webhook.name}`)
      } catch (error) {
        console.error(`Error sending notification to ${webhook.name}:`, error)
      }
    })

    await Promise.all(promises)
  } catch (error) {
    console.error("Error sending Slack notification:", error)
    throw error
  }
}

