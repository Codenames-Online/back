.PHONY: all clean test challenge

all:
	npm run tsc

clean:
	rm -rf lib/

test: all
	npm test

server: all
	ts-node src/index.ts
