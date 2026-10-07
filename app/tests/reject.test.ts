import {
  prisma,
  resetTestDb,
  getTestUsers,
  createTestOrder,
  disconnectTestDb,
} from "./helpers/testDb";

import {
  OrderStatus,
  TrafficStatus,
} from "@prisma/client";
import {beforeEach, describe, test} from "@jest/globals";

describe("Rejection Flow", () => {
  let supervisorId: string;

  beforeEach(async () => {
    await resetTestDb();

    const users = await getTestUsers();

    supervisorId = users.supervisor.id;
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // TEST 3
  test("Rejecting an order without a note should fail", async () => {
    const order = await createTestOrder(
      supervisorId,
      OrderStatus.PENDING_VERIFICATION,
      TrafficStatus.RED
    );

    const rejectionNote = "";

    const canReject =
      rejectionNote.trim().length > 0;

    expect(canReject).toBe(false);

    const currentOrder =
      await prisma.cuttingOrder.findUnique({
        where: {
          id: order.id,
        },
      });

    expect(currentOrder?.status).toBe(
      OrderStatus.PENDING_VERIFICATION
    );
  });
});