import { useMemo, useCallback, memo } from 'react';
import { FixedSizeList, type ListChildComponentProps } from 'react-window';
import type { Country } from '../../types';
import { CountryCard } from '../country-card/country-card';
import { getPopulationForYear, createYearDataMap } from '../../utils/data-transformers';

import styles from './country-list.module.css';

type CountryListProps = {
  countries: Country[];
  searchQuery: string;
  selectedColumns: string[];
  selectedRegion: string;
  selectedYear: number;
  sortField: 'name' | 'population';
  sortOrder: 'asc' | 'desc';
  onYearChange: (year: number) => void;
};

type RowData = {
  filteredCountries: Country[];
  selectedYear: number;
  selectedColumns: string[];
};

const Row = memo(({ index, style, data }: ListChildComponentProps<RowData>) => {
  const { filteredCountries, selectedYear, selectedColumns } = data;
  const country = filteredCountries[index];
  return (
    <div style={style}>
      <CountryCard
        country={country}
        selectedYear={selectedYear}
        selectedColumns={selectedColumns}
      />
    </div>
  );
});
Row.displayName = 'VirtualRow';

export const CountryList = memo(
  ({
    countries,
    searchQuery,
    selectedColumns,
    selectedRegion,
    selectedYear,
    sortField,
    sortOrder,
  }: CountryListProps) => {
    const filteredCountries = useMemo(() => {
      return countries
        .filter((c) => {
          const matchesSearch = c.id.toLowerCase().includes(searchQuery.toLowerCase());
          const matchesRegion = !selectedRegion || c.data.some((d) => d.region === selectedRegion);
          return matchesSearch && matchesRegion;
        })
        .sort((a, b) => {
          if (sortField === 'name') {
            return sortOrder === 'asc' ? a.id.localeCompare(b.id) : b.id.localeCompare(a.id);
          } else {
            const popA = getPopulationForYear(createYearDataMap(a.data), selectedYear) || 0;
            const popB = getPopulationForYear(createYearDataMap(b.data), selectedYear) || 0;
            return sortOrder === 'asc' ? popA - popB : popB - popA;
          }
        });
    }, [countries, searchQuery, selectedRegion, sortField, sortOrder, selectedYear]);

    const itemData = useMemo<RowData>(
      () => ({ filteredCountries, selectedYear, selectedColumns }),
      [filteredCountries, selectedYear, selectedColumns]
    );

    const itemKey = useCallback(
      (index: number) => filteredCountries[index].id,
      [filteredCountries]
    );

    if (filteredCountries.length === 0) {
      return <div className={styles.noResults}>No countries found.</div>;
    }

    return (
      <FixedSizeList
        height={700}
        width="100%"
        itemCount={filteredCountries.length}
        itemSize={260}
        itemData={itemData}
        itemKey={itemKey}
        className={styles.countryList}
        overscanCount={3}
      >
        {Row}
      </FixedSizeList>
    );
  }
);
CountryList.displayName = 'CountryList';