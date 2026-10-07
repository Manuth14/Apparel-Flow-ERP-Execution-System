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

describe("Sewing Queue", () => {
  let supervisorId: string;

  beforeEach(async () => {
    await resetTestDb();

    const users = await getTestUsers();

    supervisorId = users.supervisor.id;
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // TEST 5
  test("Only VERIFIED orders should appear in sewing queue", async () => {
    await createTestOrder(
      supervisorId,
      OrderStatus.VERIFIED,
      TrafficStatus.GREEN
    );

    await createTestOrder(
      supervisorId,
      OrderStatus.PENDING_VERIFICATION,
      TrafficStatus.GREEN
    );

    await createTestOrder(
      supervisorId,
      OrderStatus.REJECTED,
      TrafficStatus.RED
    );

    const sewingQueue =
      await prisma.cuttingOrder.findMany({
        where: {
          status: OrderStatus.VERIFIED,
        },
      });

    expect(sewingQueue).toHaveLength(1);

    sewingQueue.forEach((order) => {
      expect(order.status).toBe(
        OrderStatus.VERIFIED
      );
    });
  });
});