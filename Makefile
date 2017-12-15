.PHONY: all clean test challenge

all:
	npm run tsc

clean:
	rm -rf dist/

test: all
	npm test

server: all
	npm run ts-node src/index.ts
