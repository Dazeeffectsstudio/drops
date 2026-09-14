declare module "web-push" {
  export function setVapidDetails(subject: string, publicKey: string, privateKey: string): void;
  export function generateVAPIDKeys(): { publicKey: string; privateKey: string };
  export function sendNotification(
    subscription: { endpoint: string; keys: { p256dh: string; auth: string } },
    payload?: string,
    options?: Record<string, unknown>,
  ): Promise<{ statusCode: number; body: string; headers: Record<string, string> }>;
}
