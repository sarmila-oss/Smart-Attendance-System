# Automated Attendance System Using RFID and AI Face Verification

## 📌 Project Overview

The Automated Attendance System is designed to make attendance tracking more secure, accurate, and efficient. It combines RFID card detection, AI-based face verification, and session-based attendance logic to automate the attendance process.

The system verifies the RFID card and the user's face before recording attendance. It helps reduce proxy attendance, prevent duplicate entries, and maintain reliable attendance records.

## 🎯 Objectives

- Automate the attendance recording process.
- Identify users using RFID cards.
- Verify user identity using face recognition.
- Prevent unauthorized and duplicate attendance entries.
- Record check-in and check-out times.
- Track attendance sessions and calculate working hours.
- Maintain attendance records for future reference.

## ✨ Key Features

- **RFID Detection:** Identifies users through RFID cards.
- **AI Face Verification:** Verifies the user's face before marking attendance.
- **Session-Based Logic:** Manages attendance sessions and check-in/check-out operations.
- **Duplicate Prevention:** Helps prevent multiple attendance entries within the same session.
- **Attendance Records:** Stores attendance details for tracking and reporting.
- **Time Tracking:** Supports check-in time, check-out time, and working-hour calculation.

## 🛠️ Technologies Used

- Python
- OpenCV
- RFID Reader and RFID Cards
- Face Recognition
- SQLite / JSON for data storage, depending on the implementation

## ⚙️ System Workflow

1. The user scans their RFID card.
2. The system identifies the registered RFID card.
3. The camera captures the user's face.
4. The face verification module checks the user's identity.
5. If both verifications are successful, the system processes the attendance session.
6. The attendance record and corresponding time are stored.
7. The system prevents invalid or duplicate attendance entries according to the configured session rules.

## 📂 Project Structure

```text
Automated-Attendance-System/
│
├── main.py
├── attendance.py
├── face_recognition.py
├── rfid_reader.py
├── database.py
├── requirements.txt
├── README.md
└── attendance_records/
```

*Note: This is a suggested folder structure. Modify the filenames and folders to match your actual project.*

## 🚀 Installation and Setup

### 1. Clone the Repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
```

### 2. Open the Project Folder

```bash
cd Automated-Attendance-System
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

Install only the libraries required by your implementation.

### 4. Connect the Hardware

- Connect the compatible RFID reader.
- Connect the webcam or camera.
- Configure the RFID reader and camera in the application.

### 5. Run the Application

```bash
python main.py
```

*The commands and filenames may need adjustment according to the actual project implementation.*

## 📋 Attendance Data

The system can maintain the following information:

- Employee or Student ID
- Name
- RFID Card ID
- Attendance Date
- Check-in Time
- Check-out Time
- Attendance Status
- Total Working Hours

## 🔐
