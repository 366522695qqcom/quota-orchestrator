{
  "moduleFileExtensions": ["js", "json", "ts"],
  "rootDir": ".",
  "testEnvironment": "node",
  "testRegex": ".*\\.spec\\.ts$",
  "transform": {
    "^.+\\.(t|j)s$": "ts-jest"
  },
  "collectCoverageFrom": [
    "**/*.(t|j)s"
  ],
  "coverageDirectory": "../coverage",
  "coverageReporters": [
    "text-summary",
    "lcov"
  ],
  "moduleNameMapper": {
    "^@nestjs/(.*)$": "<rootDir>/../node_modules/@nestjs/$1",
    "^@prisma/client$": "<rootDir>/../node_modules/@prisma/client"
  }
}