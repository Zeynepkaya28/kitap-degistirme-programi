import 'package:flutter/material.dart';
import 'package:mobile_scanner/mobile_scanner.dart';
import 'package:file_picker/file_picker.dart';
import 'package:flutter_chips_input/flutter_chips_input.dart';
import 'package:cached_network_image/cached_network_image.dart';
import '../services/book_service.dart';

class AddBookScreen extends StatefulWidget {
  const AddBookScreen({Key? key}) : super(key: key);

  @override
  _AddBookScreenState createState() => _AddBookScreenState();
}

class _AddBookScreenState extends State<AddBookScreen> {
  final BookService _bookService = BookService();
  final _formKey = GlobalKey<FormState>();
  int _currentStep = 0;
  bool _isLoading = false;
  String? _isbn;
  Map<String, dynamic>? _bookData;
  List<String> _selectedCategories = [];
  List<String> _selectedTags = [];
  String _status = 'Yeni gibi';
  String _exchangePreference = 'Takas yapılabilir';

  final List<String> _statusOptions = [
    'Yeni gibi',
    'Az kullanılmış',
    'Yıpranmış',
    'Çok yıpranmış'
  ];

  final List<String> _exchangeOptions = [
    'Takas yapılabilir',
    'Sadece satış',
    'Sadece takas'
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Kitap Ekle'),
      ),
      body: Stepper(
        currentStep: _currentStep,
        onStepContinue: () {
          if (_currentStep < 2) {
            setState(() {
              _currentStep += 1;
            });
          } else {
            _submitForm();
          }
        },
        onStepCancel: () {
          if (_currentStep > 0) {
            setState(() {
              _currentStep -= 1;
            });
          }
        },
        steps: [
          Step(
            title: const Text('ISBN Girişi'),
            content: _buildISBNStep(),
            isActive: _currentStep >= 0,
          ),
          Step(
            title: const Text('Kitap Detayları'),
            content: _buildDetailsStep(),
            isActive: _currentStep >= 1,
          ),
          Step(
            title: const Text('Yayınla'),
            content: _buildPublishStep(),
            isActive: _currentStep >= 2,
          ),
        ],
      ),
    );
  }

  Widget _buildISBNStep() {
    return Column(
      children: [
        TextFormField(
          decoration: const InputDecoration(
            labelText: 'ISBN',
            hintText: 'Kitabın ISBN numarasını girin',
          ),
          onChanged: (value) => _isbn = value,
        ),
        const SizedBox(height: 20),
        ElevatedButton.icon(
          onPressed: _scanBarcode,
          icon: const Icon(Icons.camera_alt),
          label: const Text('Barkod Tara'),
        ),
        const SizedBox(height: 20),
        ElevatedButton.icon(
          onPressed: _pickCSVFile,
          icon: const Icon(Icons.upload_file),
          label: const Text('CSV ile Toplu Ekle'),
        ),
      ],
    );
  }

  Widget _buildDetailsStep() {
    if (_bookData == null) {
      return const Center(
        child: Text('Lütfen önce ISBN girin'),
      );
    }

    return SingleChildScrollView(
      child: Column(
        children: [
          if (_bookData!['imageLinks'] != null)
            CachedNetworkImage(
              imageUrl: _bookData!['imageLinks']['thumbnail'],
              height: 200,
              placeholder: (context, url) => const CircularProgressIndicator(),
              errorWidget: (context, url, error) => const Icon(Icons.error),
            ),
          const SizedBox(height: 20),
          Text(
            _bookData!['title'],
            style: Theme.of(context).textTheme.headline6,
          ),
          const SizedBox(height: 10),
          Text(
            _bookData!['authors'].join(', '),
            style: Theme.of(context).textTheme.subtitle1,
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            value: _status,
            decoration: const InputDecoration(labelText: 'Kitap Durumu'),
            items: _statusOptions.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (String? newValue) {
              setState(() {
                _status = newValue!;
              });
            },
          ),
          const SizedBox(height: 20),
          DropdownButtonFormField<String>(
            value: _exchangePreference,
            decoration: const InputDecoration(labelText: 'Takas Tercihi'),
            items: _exchangeOptions.map((String value) {
              return DropdownMenuItem<String>(
                value: value,
                child: Text(value),
              );
            }).toList(),
            onChanged: (String? newValue) {
              setState(() {
                _exchangePreference = newValue!;
              });
            },
          ),
          const SizedBox(height: 20),
          FutureBuilder<List<String>>(
            future: _bookService.getCategories(),
            builder: (context, snapshot) {
              if (snapshot.hasData) {
                return ChipsInput(
                  initialValue: _selectedCategories,
                  decoration: const InputDecoration(labelText: 'Kategoriler'),
                  findSuggestions: (String query) {
                    return snapshot.data!.where((category) {
                      return category.toLowerCase().contains(query.toLowerCase());
                    }).toList();
                  },
                  onChanged: (data) {
                    setState(() {
                      _selectedCategories = data;
                    });
                  },
                  chipBuilder: (context, state, category) {
                    return InputChip(
                      key: ObjectKey(category),
                      label: Text(category),
                      onDeleted: () => state.deleteChip(category),
                      materialTapTargetSize: MaterialTapTargetSize.shrinkWrap,
                    );
                  },
                  suggestionBuilder: (context, state, category) {
                    return ListTile(
                      key: ObjectKey(category),
                      title: Text(category),
                      onTap: () => state.selectSuggestion(category),
                    );
                  },
                );
              }
              return const CircularProgressIndicator();
            },
          ),
        ],
      ),
    );
  }

  Widget _buildPublishStep() {
    return Column(
      children: [
        if (_bookData != null) ...[
          Text('Kitap Adı: ${_bookData!['title']}'),
          Text('Yazar: ${_bookData!['authors'].join(', ')}'),
          Text('Durum: $_status'),
          Text('Takas Tercihi: $_exchangePreference'),
        ],
        const SizedBox(height: 20),
        ElevatedButton(
          onPressed: _submitForm,
          child: const Text('Yayınla'),
        ),
      ],
    );
  }

  Future<void> _scanBarcode() async {
    final result = await Navigator.push(
      context,
      MaterialPageRoute(
        builder: (context) => Scaffold(
          appBar: AppBar(title: const Text('Barkod Tara')),
          body: MobileScanner(
            onDetect: (capture) {
              final List<Barcode> barcodes = capture.barcodes;
              for (final barcode in barcodes) {
                if (barcode.rawValue != null) {
                  Navigator.pop(context, barcode.rawValue);
                }
              }
            },
          ),
        ),
      ),
    );

    if (result != null) {
      setState(() {
        _isbn = result;
      });
      await _fetchBookDetails();
    }
  }

  Future<void> _pickCSVFile() async {
    final result = await FilePicker.platform.pickFiles(
      type: FileType.custom,
      allowedExtensions: ['csv'],
    );

    if (result != null) {
      final file = result.files.first;
      final content = String.fromCharCodes(file.bytes!);
      // TODO: CSV içeriğini işle
    }
  }

  Future<void> _fetchBookDetails() async {
    if (_isbn == null || _isbn!.isEmpty) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final bookData = await _bookService.getBookDetailsFromISBN(_isbn!);
      if (bookData != null) {
        setState(() {
          _bookData = bookData;
        });
      } else {
        ScaffoldMessenger.of(context).showSnackBar(
          const SnackBar(content: Text('Kitap bulunamadı')),
        );
      }
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Hata: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }

  Future<void> _submitForm() async {
    if (_bookData == null) return;

    setState(() {
      _isLoading = true;
    });

    try {
      final bookId = await _bookService.addBook(_bookData!);
      await _bookService.addUserBook(
        'current_user_id', // TODO: Gerçek kullanıcı ID'sini kullan
        bookId,
        {
          'status': _status,
          'exchangePreference': _exchangePreference,
          'categories': _selectedCategories,
          'tags': _selectedTags,
        },
      );

      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Kitap başarıyla eklendi')),
      );
      Navigator.pop(context);
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Hata: $e')),
      );
    } finally {
      setState(() {
        _isLoading = false;
      });
    }
  }
} 