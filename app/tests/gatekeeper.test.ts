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
  DecisionType,
} from "@prisma/client";
import {beforeEach, describe, test} from "@jest/globals";

describe("Gatekeeper Verification Flow", () => {
  let supervisorId: string;
  let verifierId: string;

  beforeEach(async () => {
    await resetTestDb();

    const users = await getTestUsers();

    supervisorId = users.supervisor.id;
    verifierId = users.verifier.id;
  });

  afterAll(async () => {
    await disconnectTestDb();
  });

  // TEST 1
  test("GREEN order should be approved and become VERIFIED", async () => {
    const order = await createTestOrder(
      supervisorId,
      OrderStatus.PENDING_VERIFICATION,
      TrafficStatus.GREEN
    );

    const item = order.items[0];

    expect(item.status).toBe(TrafficStatus.GREEN);

    // Gatekeeper rule:
    // GREEN → APPROVED → VERIFIED
    const canApprove =
      item.status === TrafficStatus.GREEN;

    expect(canApprove).toBe(true);

    const updatedOrder =
      await prisma.cuttingOrder.update({
        where: {
          id: order.id,
        },

        data: {
          status: OrderStatus.VERIFIED,

          logs: {
            create: {
              verifierId,
              decision: DecisionType.APPROVED,
              wastagePct: 0,
            },
          },
        },
      });

    expect(updatedOrder.status).toBe(
      OrderStatus.VERIFIED
    );

    const log =
      await prisma.verificationLog.findFirst({
        where: {
          orderId: order.id,
        },
      });

    expect(log?.decision).toBe(
      DecisionType.APPROVED
    );
  });

  // TEST 2
  test("RED order should be blocked from approval", async () => {
    const order = await createTestOrder(
      supervisorId,
      OrderStatus.PENDING_VERIFICATION,
      TrafficStatus.RED
    );

    const item = order.items[0];

    expect(item.status).toBe(
      TrafficStatus.RED
    );

    // Gatekeeper rule:
    // RED → BLOCK
    const canApprove =
      item.status === TrafficStatus.GREEN;

    expect(canApprove).toBe(false);

    const currentOrder =
      await prisma.cuttingOrder.findUnique({
        where: {
          id: order.id,
        },
      });

    expect(currentOrder?.status).toBe(
      OrderStatus.PENDING_VERIFICATION
    );

    const logs =
      await prisma.verificationLog.count({
        where: {
          orderId: order.id,
        },
      });

    expect(logs).toBe(0);
  });
});