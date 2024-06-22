"use server";

import prisma from "@/lib/prisma";

export const addUserAction = async (address: string) => {
  await prisma.user.upsert({
    where: { address },
    update: {},
    create: {
      address,
    },
  });
};

export const fetchUserAction = async (address: string) => {
  const user = await prisma.user.findUnique({
    where: { address },
    select: {
      address: true,
      tsa: true,
    },
  });
  return user;
};

export const updateUserAction = async (address: string, tsa: string) => {
  await prisma.user.update({
    where: { address },
    data: {
      tsa,
    },
  });
};
