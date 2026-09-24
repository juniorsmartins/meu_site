import { faker } from '@faker-js/faker';

export function createRandomUser() {
  return {
    userId: faker.string.uuid(),
    username: faker.internet.username(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    password: faker.internet.password(),
    birthdate: faker.date.birthdate(),
    registeredAt: faker.date.past(),
  };
}

export function createRandomUsers(amount = 2) {
  const total = Number(amount);

  if (!Number.isInteger(total) || total < 1) {
    throw new Error('amount precisa ser um numero inteiro maior que 0');
  }

  return Array.from({ length: total }, () => createRandomUser());
}



