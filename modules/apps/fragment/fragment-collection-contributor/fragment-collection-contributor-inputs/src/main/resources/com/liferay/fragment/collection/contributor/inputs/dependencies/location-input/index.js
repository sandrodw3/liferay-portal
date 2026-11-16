const container = document.getElementById(
	`${fragmentElementId}-location-input-map`
);

if (container) {
	import('@liferay/fragment-impl/api').then(({renderLocationInput}) => {
		renderLocationInput(container, {
			availableLanguageIds: input.attributes.availableLanguageIds,
			defaultLanguageId: input.attributes.defaultLanguageId,
			disabled:
				layoutMode === 'edit' || input.attributes.disabled === true,
			googleMapsAPIKey: input.attributes.googleMapsAPIKey,
			localizable: input.localizable,
			mapProviderKey: input.attributes.mapProviderKey,
			name: input.name,
			namespace: fragmentElementId,
			readOnly: input.readOnly,
			readOnlyLabelId: `${fragmentElementId}-location-read-only`,
			unlocalizedFieldsState: input.attributes.unlocalizedFieldsState,
			value: input.value,
			valueI18n: input.valueI18n,
		});
	});
}
