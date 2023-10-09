import React, { useState } from 'react';
import { Formik, Form, ErrorMessage } from 'formik';
import * as Yup from 'yup';
import { Button, TextField, Typography, Container, CircularProgress } from '@mui/material';
import { styled } from '@mui/system';

const BookSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Too Short!')
    .max(50, 'Too Long!'),
});

const FormContainer = styled(Container)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
});

const LendForm: React.FC = () => {
  const [bookSearch, setBookSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const apiKey = process.env.REACT_APP_GOOGLE_BOOKS_API_KEY;

  const handleSearch = (value: string) => {
    if (value) {
      fetch(`https://www.googleapis.com/books/v1/volumes?q=${value}&key=${process.env.REACT_APP_GOOGLE_BOOKS_API_KEY}`)

        .then(response => response.json())
        .then(data => setSearchResults(data.items || []))
        .catch(error => console.error(error));
    }
  };

  const handleOwnBookClick = (book: any) => {
    const title = book.volumeInfo.title;
    const author = book.volumeInfo.authors && book.volumeInfo.authors.join(', ');
    const description = book.volumeInfo.description;
    const imageUrl = book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail;
    const googleBooksId = book.id;

    // Handle the selected book here
  };

  const renderSearchResults = searchResults.map((book: any) => (
    <div key={book.id}>
      <p>{book.volumeInfo.title} by {book.volumeInfo.authors && book.volumeInfo.authors.join(', ')}</p>
      {book.volumeInfo.imageLinks && book.volumeInfo.imageLinks.thumbnail && (
        <img src={book.volumeInfo.imageLinks.thumbnail} alt={book.volumeInfo.title} />
      )}
      <button onClick={() => handleOwnBookClick(book)}>I Own This Book</button>
    </div>
  ));

  return (
    <FormContainer>
      <Typography variant="h5" gutterBottom>
        Lend a Book
      </Typography>
      <Formik
        initialValues={{ title: '' }}
        validationSchema={BookSchema}
        onSubmit={(values, actions) => {
          handleSearch(values.title);
          actions.setSubmitting(false);
        }}
      >
        {({ isSubmitting, handleChange, values }) => (
          <Form>
            <TextField
              fullWidth
              margin="normal"
              name="title"
              onChange={handleChange}
              value={values.title}
              label="Book Title"
              variant="outlined"
            />
            <ErrorMessage name="title" component="div" />
            <Button type="submit" disabled={isSubmitting} variant="contained" color="primary">
              Look up Book Title
            </Button>
            {isSubmitting && <CircularProgress />} {/* Loading Spinner */}
          </Form>
        )}
      </Formik>
      <div>
        {renderSearchResults}
      </div>
    </FormContainer>
  );
};

export default LendForm;
