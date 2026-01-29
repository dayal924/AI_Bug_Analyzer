🐛 BugAnalyzer — AI Bug Prediction Agent

Developed for Karukrit 2026 Hackathon
📍 Centurion University of Technology and Management (CUTM)

BugAnalyzer is an AI-based software analysis agent designed to predict potential bugs and vulnerabilities before deployment.
It analyzes source code, historical bug patterns, and structural logic to identify risky components early in the development cycle.

📋 Project Overview

The goal of this project is to reduce:

Post-release software failures

Debugging time

Maintenance cost

Security risks

By performing static code analysis + pattern detection, BugAnalyzer helps developers catch issues at an early stage of development.

🌟 Key Features
🔍 Deep AST Scanning

Uses Python’s Abstract Syntax Tree (AST) for deep logic analysis

Detects:

Infinite loops

Unsafe eval / exec usage

Logic flaws

Arbitrary code execution

🛡️ Security Guard

Detects language-specific vulnerabilities:

JavaScript → XSS attacks

C++ → Buffer overflows

Java → Command injection

🌐 Universal Pattern Matching

Advanced Regex engine

Supports:

C++

Java

JavaScript

📊 Code Metrics

Provides real-time statistics:

Lines of Code (LOC)

Loop counts

Cyclomatic complexity

Function density

⚖️ Intelligent Risk Scoring

Issues are weighted by severity:

🔴 Critical

🟠 High

🟡 Medium

🟢 Low

Generates a final risk percentage for the project

🛠️ Tech Stack
Component	Technology
Backend	Python, FastAPI, Uvicorn
Frontend	HTML5, Tailwind CSS, Vanilla JavaScript
Analysis Engine	AST (Abstract Syntax Tree), Regex
👥 Team: Code Crusaders

Participating in Karukrit 2026
Department of CSE, CUTM

Lipsita Khadgarai — Team Lead

Ashish Nayak

Dayal Kumar Padhy

Kamolika Patra

🚀 Getting Started
1️⃣ Installation

Clone the repository and install dependencies:

git clone https://github.com/dayal924/AI_Bug_Analyzer.git
cd AI_Bug_Analyzer
pip install -r requirements.txt

2️⃣ Run the Engine

Start the FastAPI backend server:

python main.py


Server will run at:

http://127.0.0.1:8000

3️⃣ Usage

Open index.html in any modern browser

Paste your code snippet or upload a source file

Select the programming language (or Auto-detect)

Click Run Prediction Agent

View the risk report and suggestions

📖 Methodology

BugAnalyzer follows a 4-step Prediction Pipeline:

1. Ingestion

Accepts code via UI (paste or file upload)

2. Tokenization

Parses code into AST (for Python)

Extracts logical structures and flows

3. Inference

Matches code against:

Known vulnerability signatures

Historical bug patterns

Regex-based rules

4. Reporting

Generates:

Line-wise issue report

Severity level

Fix suggestions

Overall risk score

📌 Future Enhancements

ML-based bug prediction model

GitHub repository scanning

CI/CD integration

Support for more languages

Auto-fix suggestions

📜 License

This project is developed for academic & hackathon purposes.