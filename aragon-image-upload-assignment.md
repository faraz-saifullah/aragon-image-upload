# [Aragon.ai](http://Aragon.ai) Technical Challenge

Hello! Thanks for participating in Aragon.ai’s technical interview today!

Your challenge will be to architect a solution to the following problem. There is a time limit with this challenge, so it’s essential to prioritize the most important features. For example it’s better to implement 7/10 requirements well, than it is to do 10/10 requirements poorly. It’s also recommended that during the challenge you use AI tools such as chatgpt, claude, deepseek to help accelerate your progress.

However keep in mind that AI is not a replacement for code quality or craftsmanship. For example, relying on the agent feature to build your entire app will lead to issues like poor code quality, visual design issues, bugs, bad ux, architecture, and hallucinations. If AI could handle this perfectly, there would be no need for human engineers. It’s still essential to demonstrate your technical skill and craftsmanship — use AI as a tool to boost your efficiency, not as a substitute for expertise.

Demo of what you’ll be building

https://www.loom.com/share/7a145e4782c440ff80d0190fc8d69e67?sid=a7de7f29-b33d-4dbc-b2c9-e886155fee5c

## Requirements

Your users should be able to:

### **Frontend**

- Users should be able to **upload images**, which will be categorized into **Accepted** and **Rejected** sections based on validations.
- Implement **frontend validations** to allow only **HEIC, PNG, and JPEG** formats before uploading.
- Provide **real-time feedback** to users about the status of their uploads (e.g., success, failure, reasons for rejection).
- Use **state management** (e.g., React hooks) for handling the image upload process.
- Display **image previews** for uploaded files.

### **Backend**

- Develop a **REST API** using **Node.js** with **Express** or **GraphQL**.
- Store image metadata and statuses in a **PostgreSQL** database with a well-structured schema.
- Store image files in **Amazon S3** or an equivalent cloud storage service. You can setup a free tier account or use another equivalent infra service that is easy to setup
- Ensure API endpoints follow proper **RESTful or GraphQL conventions** (e.g., CRUD operations).
- Design an efficient system for **storing, retrieving, and processing images** asynchronously.
- Implement **secure file handling** to prevent vulnerabilities.
- Use an **ORM** (Knex.js, Prisma, Objection.js, or Sequelize) for database interactions.
- Optimize database queries for **performance and scalability** to handle **large-scale uploads**.
- Implement a system for **converting HEIC images** to PNG or JPEG format using an image processing library (e.g., `sharp` or `imagemagick`).

### **Validation Requirements**

The image validation rules to implement:

1. **Reject images** that are **too small** in size or resolution.
2. **Reject images** that are not in **JPG, PNG, or HEIC** format.
3. **Reject images** that are **too similar** to an existing one (Hint: A simple JavaScript algorithm can detect duplicates).
4. **Reject blurry images** (May require an external API or an algorithm like **Laplacian variance**).
5. **Reject images** if the **detected face is too small** (May require external API like **AWS Rekognition** or **OpenCV**).
6. **Reject images** containing **multiple faces** (May require external API).

### Submission Instructions

Take up to 2.5 hr to work on the challenge

Take up to 30 minutes for the submission

Total max time is 3 hours

Send the final solution to akhil@aragon.ai

When you send the solution. Include the source code either via google drive or github link.

Include a [loom](https://www.loom.com/) or screen recording with your submission where you explain the functionality that you’ve built. You should walk through the feature particularly focusing on explaining your architecture choices and technical decisions/tradeoffs. Communication here will be important.
