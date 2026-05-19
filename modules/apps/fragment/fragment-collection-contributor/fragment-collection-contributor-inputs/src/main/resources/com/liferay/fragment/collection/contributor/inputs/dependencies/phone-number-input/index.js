const errorContainer = document.getElementById(
	`${fragmentElementId}-phone-input-error`
);
const errorMessageContainer = document.getElementById(
	`${fragmentElementId}-phone-input-error-message`
);
const formGroup = document.getElementById(`${fragmentElementId}-form-group`);
const inputsContainer = document.getElementById(
	`${fragmentElementId}-inputs-container`
);
const phoneInput = document.getElementById(`${fragmentElementId}-phone-input`);
const prefixFixedFlag = document.getElementById(
	`${fragmentElementId}-phone-input-prefix-flag`
);
const prefixSelect = document.getElementById(
	`${fragmentElementId}-phone-input-prefix-select`
);

const fixedPrefix = input.attributes.prefix || '';
const prefixType = input.attributes.prefixType || 'definedByUser';
const showCountryFlag = configuration.showCountryFlag !== false;

const countries = (input.attributes.countries || []).map((country) => ({
	a2: country.a2,
	idd: country.prefix,
	name: country.name,
}));

const countriesByIddLength = [...countries].sort(
	(a, b) => b.idd.length - a.idd.length
);

function getFlagEmoji(a2) {
	if (!a2) {
		return '';
	}

	return String.fromCodePoint(
		...[...a2.toUpperCase()].map(
			(char) => 0x1f1e6 + char.charCodeAt(0) - 65
		)
	);
}

function getCombinedValue() {
	const digits = phoneInput.value.replace(/\D/g, '');

	if (!digits) {
		return '';
	}

	if (prefixType === 'fixed') {
		return `${fixedPrefix}${digits}`;
	}

	const option = prefixSelect?.options[prefixSelect.selectedIndex];
	const idd = option?.dataset.idd;

	return idd ? `+${idd}${digits}` : digits;
}

function parsePhoneValue(value) {
	if (!value || !value.startsWith('+')) {
		return {countryA2: '', localNumber: value || ''};
	}

	const digits = value.slice(1);

	for (const country of countriesByIddLength) {
		if (digits.startsWith(country.idd)) {
			return {
				countryA2: country.a2,
				localNumber: digits.slice(country.idd.length),
			};
		}
	}

	return {countryA2: '', localNumber: value};
}

function renderFlag(a2, container) {
	if (!container) {
		return;
	}

	container.textContent = showCountryFlag ? getFlagEmoji(a2) : '';
}

const E164_PATTERN = /^\+[1-9]\d{6,14}$/;

async function main() {
	if (!phoneInput) {
		return;
	}

	if (layoutMode === 'edit') {
		phoneInput.setAttribute('disabled', true);
		prefixSelect?.setAttribute('disabled', true);

		return;
	}

	const {focusInput, registerLocalizedInput, registerUnlocalizedInput} =
		await import('@liferay/fragment-impl/api');

	if (prefixSelect) {
		for (const country of countries) {
			const option = document.createElement('option');

			option.dataset.idd = country.idd;
			option.textContent = showCountryFlag
				? `${getFlagEmoji(country.a2)} +${country.idd} ${country.name}`
				: `+${country.idd} ${country.name}`;
			option.value = country.a2;

			prefixSelect.appendChild(option);
		}
	}

	const {countryA2, localNumber} = parsePhoneValue(phoneInput.value || '');

	phoneInput.value = localNumber;

	if (prefixSelect && countryA2) {
		prefixSelect.value = countryA2;
	}

	if (prefixType === 'fixed' && showCountryFlag) {
		const fixedCountry = countries.find(
			(country) => `+${country.idd}` === fixedPrefix
		);

		renderFlag(fixedCountry?.a2 || '', prefixFixedFlag);
	}

	if (formGroup.classList.contains('has-error')) {
		focusInput(phoneInput);
	}

	const defaultLanguageId = themeDisplay.getDefaultLanguageId();

	if (input.localizable) {
		const {onChange} = registerLocalizedInput({
			availableLanguageIds: input.attributes.availableLanguageIds,
			defaultLanguageId,
			initialValues: input.valueI18n,
			inputElement: phoneInput,
			inputName: input.name,
			localizationInputsContainer: inputsContainer,
			namespace: fragmentElementId,
		});

		const handleChange = () => onChange(getCombinedValue());

		phoneInput.addEventListener('input', handleChange);
		prefixSelect?.addEventListener('change', handleChange);

		Liferay.on('localizationSelect:localeChanged', () => {
			requestAnimationFrame(() => {
				const parsed = parsePhoneValue(phoneInput.value || '');

				phoneInput.value = parsed.localNumber;

				if (prefixSelect && parsed.countryA2) {
					prefixSelect.value = parsed.countryA2;
				}
			});
		});
	}
	else {
		registerUnlocalizedInput({
			defaultLanguageId,
			inputElement: phoneInput,
			readOnlyInputLabel: document.getElementById(
				`${fragmentElementId}-phone-input-readonly`
			),
			unlocalizedFieldsState: input.attributes.unlocalizedFieldsState,
			unlocalizedMessageContainer: document.getElementById(
				`${fragmentElementId}-unlocalized-info`
			),
		});

		phoneInput.closest('form')?.addEventListener(
			'submit',
			() => {
				phoneInput.value = getCombinedValue();
			},
			true
		);
	}

	phoneInput.addEventListener('blur', () => {
		const combined = getCombinedValue();

		if (!combined || !errorContainer || !errorMessageContainer) {
			return;
		}

		if (E164_PATTERN.test(combined)) {
			formGroup.classList.remove('has-error');
			errorContainer.classList.add('sr-only');
		}
		else {
			errorMessageContainer.textContent = Liferay.Language.get(
				'please-enter-a-valid-phone-number'
			);

			formGroup.classList.add('has-error');
			errorContainer.classList.remove('sr-only');
		}
	});
}

main();
