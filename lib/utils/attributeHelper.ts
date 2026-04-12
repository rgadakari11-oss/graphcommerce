export const getUnitLabel = (
  value: string | number | null | undefined,
  attributeData: any
) => getAttributeLabel(value, 'unit_of_measurement', attributeData)

export const getMqaLabel = (
  value: string | number | null | undefined,
  attributeData: any
) => getAttributeLabel(value, 'mqa', attributeData)

export const getAttributeLabel = (
  value: string | number | null | undefined,
  attributeCode: string,
  attributeData: any
): string => {
  if (!value || !attributeData) return ''

  const attribute = attributeData?.customAttributeMetadata?.items?.find(
    (item: any) => item.attribute_code === attributeCode
  )

  return (
    attribute?.attribute_options?.find(
      (opt: any) => opt.value === String(value)
    )?.label ?? String(value)
  )
}