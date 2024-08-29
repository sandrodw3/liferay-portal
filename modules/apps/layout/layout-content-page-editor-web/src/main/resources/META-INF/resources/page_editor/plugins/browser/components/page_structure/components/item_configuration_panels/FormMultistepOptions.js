/**
 * SPDX-FileCopyrightText: (c) 2000 Liferay, Inc. https://liferay.com
 * SPDX-License-Identifier: LGPL-2.1-or-later OR LicenseRef-Liferay-DXP-EULA-2.0.0-2023-06
 */

import {useControlledState} from '@liferay/layout-js-components-web';
import classNames from 'classnames';
import {openModal} from 'frontend-js-web';
import React, {useCallback} from 'react';

import {CheckboxField} from '../../../../../../app/components/fragment_configuration_fields/CheckboxField';
import {SelectField} from '../../../../../../app/components/fragment_configuration_fields/SelectField';
import {TextField} from '../../../../../../app/components/fragment_configuration_fields/TextField';
import {
	useItemLocalConfig,
	useUpdateItemLocalConfig,
} from '../../../../../../app/contexts/LocalConfigContext';
import {
	useDispatch,
	useSelector,
	useSelectorRef,
} from '../../../../../../app/contexts/StoreContext';
import selectLanguageId from '../../../../../../app/selectors/selectLanguageId';
import {getStepperChild} from '../../../../../../app/utils/getStepperChild';
import updateConfigurationValue from '../../../../../../app/utils/updateConfigurationValue';

const FORM_TYPE_OPTIONS = [
	{label: Liferay.Language.get('simple'), value: 'simple'},
	{label: Liferay.Language.get('multi-step'), value: 'multistep'},
];

export default function FormMultistepOptions({item, onValueSelect}) {
	const localConfig = useItemLocalConfig(item.itemId);

	const updateItemLocalConfig = useUpdateItemLocalConfig();

	const [formType, setFormType] = useControlledState(item.config.formType);

	const [numberOfSteps, setNumberOfSteps] = useControlledState(
		item.config.numberOfSteps
	);

	const dispatch = useDispatch();

	const languageId = useSelector(selectLanguageId);

	const layoutData = useSelectorRef((state) => state.layoutData).current;
	const fragmentEntryLinks = useSelectorRef(
		(state) => state.fragmentEntryLinks
	).current;

	const updateNumberOfSteps = useCallback(
		(value) => {
			setNumberOfSteps(value);

			onValueSelect({numberOfSteps: value}).then(() => {
				const stepperItem = getStepperChild(
					item,
					layoutData,
					fragmentEntryLinks
				);

				if (!stepperItem) {
					return;
				}

				const stepperFragment =
					fragmentEntryLinks[stepperItem.config.fragmentEntryLinkId];

				updateConfigurationValue({
					configuration: stepperFragment.configuration,
					dispatch,
					fragmentEntryLink: stepperFragment,
					languageId,
					name: 'numberOfSteps',
					value,
				});
			});
		},
		[
			dispatch,
			fragmentEntryLinks,
			item,
			languageId,
			layoutData,
			onValueSelect,
			setNumberOfSteps,
		]
	);

	return (
		<>
			<SelectField
				className={classNames('mb-2', {
					'mt-3': Liferay.FeatureFlags['LPD-20213'],
				})}
				field={{
					label: Liferay.Language.get('form-type'),
					name: 'formType',
					typeOptions: {
						validValues: FORM_TYPE_OPTIONS,
					},
				}}
				onValueSelect={(_name, formType) => {
					setFormType(formType);

					if (formType === 'multistep') {
						onValueSelect({
							formType,
							numberOfSteps: 2,
						});
					}
					else {
						openWarningModal({
							onCancel: () => {
								setFormType('multistep');
							},
							onContinue: () => {
								onValueSelect({
									formType: 'simple',
									numberOfSteps: 1,
								});
							},
						});
					}
				}}
				value={formType}
			/>

			{formType === 'multistep' ? (
				<TextField
					field={{
						label: Liferay.Language.get('number-of-steps'),
						typeOptions: {
							validation: {
								errorMessage: Liferay.Language.get(
									'at-least-two-steps-are-required'
								),
								min: 2,
								type: 'number',
							},
						},
					}}
					onValueSelect={(_, numberOfSteps) =>
						updateNumberOfSteps(numberOfSteps)
					}
					value={numberOfSteps || 2}
				/>
			) : null}

			{formType === 'multistep' ? (
				<CheckboxField
					field={{
						label: Liferay.Language.get(
							'display-all-steps-in-edit-mode'
						),
						name: 'displayAllSteps',
					}}
					onValueSelect={(_name, value) => {
						updateItemLocalConfig(item.itemId, {
							displayAllSteps: value,
						});
					}}
					value={localConfig.displayAllSteps}
				/>
			) : null}
		</>
	);
}

function openWarningModal({onCancel, onContinue}) {
	openModal({
		bodyHTML: Liferay.Language.get(
			'this-action-will-delete-the-stepper-fragment-of-the-form-container'
		),

		buttons: [
			{
				autoFocus: true,
				displayType: 'secondary',
				label: Liferay.Language.get('cancel'),
				onClick: ({processClose}) => {
					processClose();
					onCancel();
				},
				type: 'cancel',
			},
			{
				displayType: 'info',
				label: Liferay.Language.get('continue'),
				onClick: ({processClose}) => {
					processClose();
					onContinue();
				},
			},
		],
		status: 'info',
		title: Liferay.Language.get('convert-to-simple-form'),
	});
}
