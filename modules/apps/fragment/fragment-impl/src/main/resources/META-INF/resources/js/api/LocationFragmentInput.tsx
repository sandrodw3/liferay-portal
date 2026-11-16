/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {
	LocationInput,
	stringifyLocationValue,
} from '@liferay/object-js-components-web';
import React, {useEffect, useRef, useState} from 'react';

import {getTranslationInput} from './getTranslationInput';
import {registerLocalizedInput} from './registerLocalizedInput';
import {registerUnlocalizedInput} from './registerUnlocalizedInput';

import type {MapProviderKey} from '@liferay/object-js-components-web';

type OnChange = ReturnType<typeof registerLocalizedInput>['onChange'];

type Props = {
	availableLanguageIds?: string[];
	defaultLanguageId: Liferay.Language.Locale;
	disabled?: boolean;
	googleMapsAPIKey?: string;
	localizable?: boolean;
	mapProviderKey?: MapProviderKey;
	name: string;
	namespace: string;
	readOnly?: boolean;
	readOnlyLabelId: string;
	unlocalizedFieldsState?: 'disabled' | 'read-only';
	value?: string;
	valueI18n?: Record<string, string>;
};

export function LocationFragmentInput({
	availableLanguageIds,
	defaultLanguageId,
	disabled,
	googleMapsAPIKey,
	localizable = false,
	mapProviderKey,
	name,
	namespace,
	readOnly,
	readOnlyLabelId,
	unlocalizedFieldsState = 'disabled',
	value = '',
	valueI18n,
}: Props) {
	const id = `${namespace}-location-input`;

	// The server escapes the value for the HTML, which breaks the JSON.

	const [serializedValue, setSerializedValue] = useState(() =>
		Liferay.Util.unescapeHTML(value)
	);

	const [unlocalized, setUnlocalized] = useState(false);

	const onChangeRef = useRef<OnChange>();

	const registeredRef = useRef(false);

	useEffect(() => {

		// Registering twice would attach a second set of Liferay listeners.

		if (registeredRef.current) {
			return;
		}

		registeredRef.current = true;

		const valueInput = document.getElementById(
			`${id}-value`
		) as HTMLInputElement;

		if (!localizable) {
			registerUnlocalizedInput({
				changeTextDirection: false,
				customLocaleChangeHandler: true,
				defaultLanguageId,
				inputElement: valueInput,
				onLocaleChange: (languageId) =>
					setUnlocalized(languageId !== defaultLanguageId),
				readOnlyInputLabel: document.getElementById(
					readOnlyLabelId
				) as HTMLSpanElement,
				unlocalizedFieldsState,
				unlocalizedMessageContainer: document.getElementById(
					`${namespace}-unlocalized-info`
				)!,
			});

			return;
		}

		const localizationInputsContainer = document.getElementById(
			`${id}-translations`
		)!;

		let currentLanguageId: string = defaultLanguageId;

		const translationInput = (languageId: string) =>
			getTranslationInput({
				inputId: valueInput.id,
				inputName: name,
				languageId,
				localizationInputsContainer,
				namespace,
			});

		const setValue = (value = '') => {
			const unescapedValue = Liferay.Util.unescapeHTML(value);

			valueInput.value = unescapedValue;

			setSerializedValue(unescapedValue);
		};

		const {onChange} = registerLocalizedInput({
			availableLanguageIds,
			changeTextDirection: false,
			defaultLanguageId,
			initialValues: valueI18n,
			inputElement: valueInput,
			inputName: name,
			localizationInputsContainer,
			namespace,
			onAutoTranslate: ({languageId, value}) => {
				translationInput(languageId).value = value ?? '';

				if (languageId === currentLanguageId) {
					setValue(value);
				}
			},
			onLocaleChange: ({languageId, value}) => {
				currentLanguageId = languageId;

				setValue(value);
			},
			onMarkAsTranslated: () => {
				const value = translationInput(defaultLanguageId).value;

				translationInput(currentLanguageId).value = value;

				setValue(value);
			},
			onResetTranslation: () => {
				translationInput(currentLanguageId).removeAttribute('value');

				setValue(translationInput(defaultLanguageId).value);
			},
		});

		onChangeRef.current = onChange;
	}, [
		availableLanguageIds,
		defaultLanguageId,
		id,
		localizable,
		name,
		namespace,
		readOnlyLabelId,
		unlocalizedFieldsState,
		valueI18n,
	]);

	return (
		<LocationInput
			disabled={disabled || readOnly || unlocalized}
			googleMapsAPIKey={googleMapsAPIKey}
			id={id}
			mapProviderKey={mapProviderKey}
			onLocationChange={(locationValue) => {
				const value = stringifyLocationValue(locationValue);

				(
					document.getElementById(`${id}-value`) as HTMLInputElement
				).value = value;

				setSerializedValue(value);

				onChangeRef.current?.(value);
			}}
			serializedValue={serializedValue}
		/>
	);
}
