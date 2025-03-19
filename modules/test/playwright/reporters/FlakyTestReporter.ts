/**
 * SPDX-FileCopyrightText: (c) 2025 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import * as fs from 'fs';

import type {Reporter, TestCase, TestResult} from '@playwright/test/reporter';

type FlakyTest = {
	file: string;
	name: string;
};

class FlakyTestReporter implements Reporter {
	private flakyTests: FlakyTest[] = [];
	private outputFile: string;

	constructor(options: {outputFile: string}) {
		this.outputFile = options.outputFile;
	}

	onTestEnd(test: TestCase, result: TestResult) {
		const isFlaky = result.retry > 0 && result.status === 'passed';

		if (isFlaky) {
			this.flakyTests.push({
				file: test.parent.title,
				name: test.title,
			});
		}
	}

	onEnd() {
		fs.writeFileSync(
			this.outputFile,
			JSON.stringify({flakyTests: this.flakyTests}, null, 2)
		);
	}
}

export default FlakyTestReporter;
