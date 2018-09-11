export const GREETING = `Welcome to the API bot!`;
export const USAGE = `Type anything, and I will echo it back to you.`;
export const HELP = `
- logActivity(activity: Activity): Promise<void>
   - Log an activity to the transcript.
- listTranscripts(channelId: string, continuationToken?: string): Promise<PagedResult<Transcript>>
   - List conversations in the channelId.
- getTranscriptActivities(channelId: string, conversationId: string, continuationToken?: string, startDate?: Date): Promise<PagedResult<Activity>>
   - Get activities for a conversation (Aka the transcript).
- deleteTranscript(channelId: string, conversationId: string): Promise<void>
   - Delete a specific conversation and all of it's activites.`;
export const UNKNOWN = `Sorry, I didn't understand that.`;
