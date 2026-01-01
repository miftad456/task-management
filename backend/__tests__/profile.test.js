import request from "supertest";
import { createServer } from "../server.js";
import { createTestUser, generateTestToken } from "./helpers.js";
import path from "path";
import fs from "fs";

const app = createServer();

describe("User Profile API", () => {
    let user;
    let accessToken;

    beforeEach(async () => {
        user = await createTestUser();
        const tokens = generateTestToken(user);
        accessToken = tokens.accessToken;
    });

    describe("GET /users/profile/:id", () => {
        it("should fetch a user profile", async () => {
            const response = await request(app)
                .get(`/users/profile/${user._id}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.username).toBe(user.username);
            expect(response.body.data).toHaveProperty("bio");
            expect(response.body.data).toHaveProperty("experience");
        });

        it("should fail for non-existent user", async () => {
            const fakeId = "507f1f77bcf86cd799439011";
            await request(app)
                .get(`/users/profile/${fakeId}`)
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(404);
        });
    });

    describe("PUT /users/profile/update", () => {
        it("should update user profile fields", async () => {
            const updateData = {
                name: "Updated Name",
                bio: "This is my new bio",
                experience: "5 years of coding",
            };

            const response = await request(app)
                .put("/users/profile/update")
                .set("Authorization", `Bearer ${accessToken}`)
                .send(updateData)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.name).toBe("Updated Name");
            expect(response.body.data.bio).toBe("This is my new bio");
            expect(response.body.data.experience).toBe("5 years of coding");
        });
    });

    describe("POST /users/profile/picture", () => {
        it("should upload a profile picture", async () => {
            // Create a dummy image file for testing
            const testImagePath = path.join(process.cwd(), "test-image.png");
            fs.writeFileSync(testImagePath, "dummy content");

            const response = await request(app)
                .post("/users/profile/picture")
                .set("Authorization", `Bearer ${accessToken}`)
                .attach("picture", testImagePath)
                .expect(200);

            expect(response.body.success).toBe(true);
            expect(response.body.data.profilePicture).toBeDefined();
            expect(response.body.data.profilePicture).toContain("uploads");

            // Cleanup
            if (fs.existsSync(testImagePath)) fs.unlinkSync(testImagePath);
        });

        it("should fail if no file is uploaded", async () => {
            await request(app)
                .post("/users/profile/picture")
                .set("Authorization", `Bearer ${accessToken}`)
                .expect(400);
        });
    });
});
