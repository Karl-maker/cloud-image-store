#!/usr/bin/env ts-node

import { runUserTests } from './user.integration.test';

console.log('🧪 Starting Cloud Image Server Tests...\n');

async function main() {
    try {
        await runUserTests();
        console.log('\n🎉 All tests completed successfully!');
        process.exit(0);
    } catch (error) {
        console.error('\n💥 Test execution failed:', error);
        process.exit(1);
    }
}

main(); 