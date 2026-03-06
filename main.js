export default {
  async fetch(request) {
    const url = new URL(request.url);
    const encodedTarget = url.searchParams.get('to');
    
    // We add an "ext=1" flag to know when the user has successfully escaped Telegram
    const isExternal = url.searchParams.get('ext') === '1';
    const userAgent = request.headers.get('User-Agent') || '';

    // If no link provided, show welcome
    if (!encodedTarget) {
      return new Response('🔥 Welcome to sukuna.site\n\nSecure Redirect System is Online.', { status: 200 });
    }

    // ==========================================
    // 1. THE BREAKOUT MAGIC (Force Chrome)
    // ==========================================
    // If the user is on Android AND inside Telegram AND hasn't escaped yet...
    if (userAgent.includes('Android') && userAgent.includes('Telegram') && !isExternal) {
        
        // The URL to load once Chrome opens (we add &ext=1 so we don't get stuck in a loop)
        const targetUrl = `https://${url.hostname}${url.pathname}?to=${encodedTarget}&ext=1`;
        const fallbackUrl = encodeURIComponent(targetUrl);

        // The special Android Intent that commands the phone to launch Google Chrome
        const intentUrl = `intent://${url.hostname}${url.pathname}?to=${encodedTarget}&ext=1#Intent;scheme=https;package=com.android.chrome;S.browser_fallback_url=${fallbackUrl};end;`;

        // Instantly bounce them to the intent
        const breakoutHtml = `
        <!DOCTYPE html>
        <html>
        <head>
            <meta http-equiv="refresh" content="0; url=${intentUrl}">
            <script>window.location.href = "${intentUrl}";</script>
        </head>
        <body style="background-color: #0b0f19;"></body>
        </html>
        `;
        return new Response(breakoutHtml, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    }

    // ==========================================
    // 2. THE SLEEK UI (Loads once in Chrome)
    // ==========================================
    try {
      // Decode the hidden base64 link
      const decodedTarget = atob(encodedTarget);
      
      const html = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Secure Redirect</title>
          <style>
              body { background-color: #0b0f19; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; margin: 0; }
              .container { background: #111827; padding: 40px 30px; border-radius: 16px; border: 1px solid #1f2937; box-shadow: 0 10px 25px rgba(0,0,0,0.5); text-align: center; width: 90%; max-width: 380px; }
              .icon-container { background: #1e3a8a; width: 60px; height: 60px; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px auto; }
              .icon { font-size: 28px; }
              h2 { margin: 0 0 5px 0; font-size: 22px; font-weight: 600; }
              .subtitle { color: #9ca3af; font-size: 14px; margin-bottom: 30px; }
              .box { background: #0b0f19; border: 1px solid #1f2937; border-radius: 12px; padding: 20px; position: relative; overflow: hidden; }
              
              /* Verification Step */
              .loader { border: 3px solid #1f2937; border-top: 3px solid #3b82f6; border-radius: 50%; width: 24px; height: 24px; animation: spin 1s linear infinite; margin: 0 auto 15px auto; }
              @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }
              
              /* Countdown Step */
              .countdown-circle { width: 60px; height: 60px; border-radius: 50%; border: 3px solid #3b82f6; display: flex; align-items: center; justify-content: center; font-size: 24px; font-weight: bold; margin: 0 auto 15px auto; color: #3b82f6; }
              
              .status-text { font-size: 15px; color: #d1d5db; font-weight: 500; }
              .footer { margin-top: 30px; font-size: 12px; color: #4b5563; text-transform: uppercase; letter-spacing: 1px; }
              .footer span { color: #10b981; }
          </style>
      </head>
      <body>
          <div class="container">
              <div class="icon-container">
                  <div class="icon">🔒</div>
              </div>
              <h2>Secure Redirect</h2>
              <div class="subtitle">connection established</div>

              <div class="box" id="step-verify">
                  <div class="loader"></div>
                  <div class="status-text">Verifying security...</div>
              </div>

              <div class="box" id="step-countdown" style="display: none;">
                  <div class="countdown-circle" id="timer">3</div>
                  <div class="status-text">Preparing destination...</div>
              </div>
          </div>
          
          <div class="footer">
              <span>●</span> SAFE REDIRECT IN PROGRESS
          </div>

          <script>
              setTimeout(() => {
                  document.getElementById('step-verify').style.display = 'none';
                  document.getElementById('step-countdown').style.display = 'block';
                  
                  let timeLeft = 3;
                  const timerEl = document.getElementById('timer');
                  
                  const countdown = setInterval(() => {
                      timeLeft--;
                      timerEl.textContent = timeLeft;
                      if (timeLeft <= 0) {
                          clearInterval(countdown);
                          document.getElementById('step-countdown').innerHTML = '<div class="loader"></div><div class="status-text">Switching to browser...</div>';
                          window.location.href = "${decodedTarget}";
                      }
                  }, 1000);
              }, 2000); 
          </script>
      </body>
      </html>
      `;
      
      return new Response(html, { headers: { 'Content-Type': 'text/html;charset=UTF-8' } });
    } catch (e) {
      return new Response('Invalid link format.', { status: 400 });
    }
  }
};
