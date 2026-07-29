import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart

sender_email = "patentapp123@gmail.com"
sender_password = "uuew chga resw sbdu".replace(" ", "").strip()
recipient = "patilbhushan3544@gmail.com"

subject = "PatentMind AI — Verification Test from patentapp123"
body = "Hello! This is a test email sent from patentapp123@gmail.com."

msg = MIMEMultipart()
msg['From'] = sender_email
msg['To'] = recipient
msg['Subject'] = subject
msg.attach(MIMEText(body, 'plain'))

print(f"Testing dispatch from {sender_email} to {recipient}...")

try:
    server = smtplib.SMTP_SSL("smtp.gmail.com", 465, timeout=10.0)
    server.login(sender_email, sender_password)
    server.send_message(msg)
    server.quit()
    print("SSL 465 DISPATCH SUCCESSFUL!")
except Exception as e1:
    print("SSL 465 Error:", e1)
    try:
        server = smtplib.SMTP("smtp.gmail.com", 587, timeout=10.0)
        server.starttls()
        server.login(sender_email, sender_password)
        server.send_message(msg)
        server.quit()
        print("STARTTLS 587 DISPATCH SUCCESSFUL!")
    except Exception as e2:
        print("STARTTLS 587 Error:", e2)
