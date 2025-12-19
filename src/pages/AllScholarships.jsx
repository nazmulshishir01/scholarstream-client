import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Helmet } from 'react-helmet-async';
import useAxiosPublic from '../hooks/useAxiosPublic';

const AllScholarships = () => {
  const axiosPublic = useAxiosPublic();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('all');
  const [country, setCountry] = useState('all');
  const [degree, setDegree] = useState('all');
  const [sort, setSort] = useState('date-desc');
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(false);

  const { data: filterOptions } = useQuery({
    queryKey: ['filterOptions'],
    queryFn: async () => {
      const res = await axiosPublic.get('/scholarships/categories');
      return res.data;
    }
  });

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['scholarships', search, category, country, degree, sort, page],
    queryFn: async () => {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '9'
      });

      if (search) params.append('search', search);
      if (category !== 'all') params.append('category', category);
      if (country !== 'all') params.append('country', country);
      if (degree !== 'all') params.append('degree', degree);
      if (sort) params.append('sort', sort);

      const res = await axiosPublic.get(`/scholarships?${params.toString()}`);
      return res.data;
    }
  });

  useEffect(() => {
    setPage(1);
  }, [search, category, country, degree, sort]);
