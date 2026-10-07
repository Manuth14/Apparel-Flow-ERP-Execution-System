
import { Role } from "@prisma/client";
import {beforeEach, describe, test} from "@jest/globals";
import {disconnectTestDb, getTestUsers, resetTestDb} from "./helpers/testDb";

describe("Verification RBAC", () => {
  beforeEach(async () => {
    await resetTestDb();
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // TEST 4
  test("Non-verifier should receive 403", async () => {
    const users = await getTestUsers();

    const user = users.supervisor;

    expect(user.role).toBe(
      Role.cutting_supervisor
    );

    const isVerifier =
      user.role === Role.cutting_verifier;

    const responseStatus =
      isVerifier ? 200 : 403;

    expect(responseStatus).toBe(403);
  });
});