/**
 * SPDX-FileCopyrightText: (c) 2026 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import ClayButton from '@clayui/button';
import {LanguagePicker} from '@clayui/core';
import ClayForm, {ClayInput} from '@clayui/form';
import ClayModal from '@clayui/modal';
import {FieldFeedback, useId} from 'frontend-js-components-web';
import {sub} from 'frontend-js-web';
import React, {Key, useContext, useState} from 'react';

import {FindAndReplaceContext} from '../contexts/FindAndReplaceContext';

const LOCALES = [
	{
		displayName: 'All Languages',
		id: 'all',
		label: 'All Languages',
	},
	{
		displayName: 'English (United States)',
		id: 'en_US',
		label: 'en-US',
		symbol: 'en-us',
	},
	{
		displayName: 'Español (España)',
		id: 'es_ES',
		label: 'es-ES',
		symbol: 'es-es',
	},
];

export function Setup() {
	const {closeModal, items, replacement, search, setReplacement, setView} =
		useContext(FindAndReplaceContext);

	const [hasError, setHasError] = useState(false);

	const inputId = useId();

	const handleReviewChanges = () => {
		if (!replacement) {
			setHasError(true);

			return;
		}

		setHasError(false);

		setView('summary');
	};

	if (items && !items.length) {
		return <NoMatches />;
	}

	return (
		<>
			<ClayModal.Header
				closeButtonAriaLabel={Liferay.Language.get('close')}
			>
				{Liferay.Language.get('find-and-replace')}
			</ClayModal.Header>

			<ClayModal.Body>
				<p className="text-secondary">
					{sub(
						Liferay.Language.get(
							'find-and-replace-text-across-x-selected-items'
						),
						items?.length
					)}
				</p>

				<ClayForm.Group className={hasError ? 'has-error' : ''}>
					<span className="font-weight-semi-bold text-3">
						{Liferay.Language.get('find')}
					</span>

					<p>{search}</p>

					<label htmlFor={inputId}>
						{Liferay.Language.get('replace-with-field-label')}
					</label>

					<ClayInput
						id={inputId}
						onChange={(event) => {
							const nextValue = event.target.value;

							setReplacement(nextValue);

							setHasError(!nextValue);
						}}
						placeholder={Liferay.Language.get(
							'enter-replacement-text'
						)}
						value={replacement}
					/>

					{hasError ? (
						<FieldFeedback
							errorMessage={Liferay.Language.get(
								'this-field-is-required'
							)}
						/>
					) : null}
				</ClayForm.Group>

				<LanguageSelector />
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton.Group spaced>
						<ClayButton
							displayType="secondary"
							onClick={closeModal}
						>
							{Liferay.Language.get('cancel')}
						</ClayButton>

						<ClayButton onClick={handleReviewChanges}>
							{Liferay.Language.get('review-changes')}
						</ClayButton>
					</ClayButton.Group>
				}
			/>
		</>
	);
}

function LanguageSelector() {
	const {localeId, setLocaleId} = useContext(FindAndReplaceContext);

	const [active, setActive] = useState(false);

	return (
		<LanguagePicker
			active={active}
			classNamesTrigger="mt-4"
			defaultLocaleId="all"
			locales={LOCALES}
			onActiveChange={(active: boolean) => {
				setActive(active);
			}}
			onSelectedLocaleChange={(id: Key) => {
				setLocaleId(id as string);
			}}
			selectedLocaleId={localeId}
		/>
	);
}

function NoMatches() {
	const {closeModal, search} = useContext(FindAndReplaceContext);

	return (
		<>
			<ClayModal.Header
				closeButtonAriaLabel={Liferay.Language.get('close')}
			>
				{Liferay.Language.get('find-and-replace')}
			</ClayModal.Header>

			<ClayModal.Body>
				<p>
					{sub(
						Liferay.Language.get('no-exact-matches-for-x'),
						search
					)}
				</p>

				<div className="bg-light p-3 rounded">
					<p className="font-weight-semi-bold mb-2">
						{Liferay.Language.get('tips-for-better-results')}
					</p>

					<ul className="mb-0 pl-4">
						<li>
							{Liferay.Language.get(
								'find-and-replace-only-works-with-exact-matches'
							)}
						</li>

						<li>
							{Liferay.Language.get(
								'check-your-spelling-and-try-different-variations'
							)}
						</li>

						<li>
							{Liferay.Language.get(
								'try-searching-for-a-shorter-or-more-common-term'
							)}
						</li>
					</ul>
				</div>
			</ClayModal.Body>

			<ClayModal.Footer
				last={
					<ClayButton displayType="danger" onClick={closeModal}>
						{Liferay.Language.get('ok')}
					</ClayButton>
				}
			/>
		</>
	);
}
