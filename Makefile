.PHONY: all clean test challenge

all:
	npm run tsc

clean:
	rm -rf lib/

test: all
	npm test

server: all
	npm run ts-node game/index.ts
