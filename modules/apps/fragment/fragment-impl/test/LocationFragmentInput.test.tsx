/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import '@testing-library/jest-dom';
import {act, render, screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {unescapeHTML} from 'frontend-js-web';
import React from 'react';

import {LocationFragmentInput} from '../src/main/resources/META-INF/resources/js/api/LocationFragmentInput';

const BARCELONA =
	'{"address":"Barcelona","coordinates":{"latitude":41.38,"longitude":2.17}}';

const MADRID =
	'{"address":"Madrid","coordinates":{"latitude":40.41,"longitude":-3.7}}';

// The map needs a real browser, so the picker is replaced with a button that
// picks Barcelona.

jest.mock('@liferay/object-js-components-web', () => ({
	LocationInput: ({
		disabled,
		mapProviderKey,
		onLocationChange,
		serializedValue,
	}: {
		disabled?: boolean;
		mapProviderKey?: string;
		onLocationChange: (locationValue: object) => void;
		serializedValue?: string;
	}) => (
		<button
			data-map-provider-key={mapProviderKey}
			data-serialized-value={serializedValue}
			disabled={disabled}
			onClick={() =>
				onLocationChange({
					address: 'Barcelona',
					coordinates: {latitude: 41.38, longitude: 2.17},
				})
			}
		>
			pick
		</button>
	),
	stringifyLocationValue: (locationValue: object) =>
		JSON.stringify(locationValue),
}));

// Only `LocalizationSelect` reaches CKEditor, which Jest cannot parse.

jest.mock(
	'../src/main/resources/META-INF/resources/js/api/LocalizationSelect',
	() => ({
		EVENT_INPUT_REGISTERED: 'localizedInput:registered',
		EVENT_TRANSLATION_STATUS: 'localizedInput:translationStatus',
		getSelectedLanguageId: () => null,
	})
);

const NAME = 'ObjectField_location';
const NAMESPACE = 'fragment-1';

function renderLocationFragmentInput({
	value = '',
	...props
}: Partial<React.ComponentProps<typeof LocationFragmentInput>> = {}) {
	document.body.innerHTML = `
		<div class="location-input">
			<span class="d-none" id="${NAMESPACE}-location-read-only">(read-only)</span>

			<div id="${NAMESPACE}-location-input-map"></div>

			<input id="${NAMESPACE}-location-input-value" name="${NAME}" type="hidden" value='${value}' />

			<span id="${NAMESPACE}-location-input-translations"></span>

			<div class="d-none" id="${NAMESPACE}-unlocalized-info"></div>
		</div>`;

	render(
		<LocationFragmentInput
			defaultLanguageId="en_US"
			name={NAME}
			namespace={NAMESPACE}
			readOnlyLabelId={`${NAMESPACE}-location-read-only`}
			value={value}
			{...props}
		/>,
		{container: document.getElementById(`${NAMESPACE}-location-input-map`)!}
	);
}

function getSubmittedValue() {
	return (
		document.getElementById(
			`${NAMESPACE}-location-input-value`
		) as HTMLInputElement
	).value;
}

describe('LocationFragmentInput', () => {
	beforeAll(() => {
		Liferay.Util.unescapeHTML = unescapeHTML;
	});

	beforeEach(() => {
		(Liferay.on as jest.Mock).mockClear();
	});

	it('submits the picked location as the Objects JSON string', async () => {
		renderLocationFragmentInput({mapProviderKey: 'OpenStreetMap'});

		const picker = screen.getByRole('button', {name: 'pick'});

		expect(picker).toHaveAttribute(
			'data-map-provider-key',
			'OpenStreetMap'
		);
		expect(picker).toHaveAttribute('data-serialized-value', '');

		await userEvent.click(picker);

		expect(getSubmittedValue()).toBe(BARCELONA);
		expect(picker).toHaveAttribute('data-serialized-value', BARCELONA);
	});

	it('shows the saved location that the server escaped', () => {
		renderLocationFragmentInput({value: MADRID.replace(/"/g, '&quot;')});

		expect(screen.getByRole('button', {name: 'pick'})).toHaveAttribute(
			'data-serialized-value',
			MADRID
		);
	});

	it('disables the picker', () => {
		renderLocationFragmentInput({disabled: true});

		expect(screen.getByRole('button', {name: 'pick'})).toBeDisabled();
	});

	it('disables an unlocalized picker in a language other than the default', () => {
		renderLocationFragmentInput();

		const call = (Liferay.on as jest.Mock).mock.calls.find(
			([name]) => name === 'localizationSelect:localeChanged'
		);

		act(() => call![1]({languageId: 'es_ES'}));

		expect(screen.getByRole('button', {name: 'pick'})).toBeDisabled();
	});
});
